---
id: process
title: Process
sidebar_position: 4
---

# Process

`Tsvrc.Core.Process` is the base class for networked, owner-driven processes: something
with a start/stop/complete lifecycle that one player (the owner) drives, that survives the
owner leaving, and that optionally ticks on an interval. Its generated shadow is
`TsProcess`. It's the root of TsVRC's longest inheritance chain: `PlayerTracker`,
`AutoPlayerTracker`, `ReadyCheckProcess`, and the entire `DataTransferer` chain all build
on top of it, so its ownership and lifecycle model is worth understanding well before
those pages.

## Usage

Subclass the generated shadow, override the lifecycle hooks you need, and call
`StartProcess`/`CompleteProcess` from wherever the process should begin and end:

```csharp
public class GameRound : TsProcess
{
    protected override void OnProcessStarted()
    {
        LogInfo("Round started.");
    }

    protected override void OnProcessCompleted()
    {
        LogInfo("Round complete.");
    }
}
```

```csharp
gameRound.StartProcess();
// ...later, from anywhere, owner or not:
gameRound.CompleteProcess();
```

`OnOwnerAbandonedProcess` is the one hook that fires on someone other than the process
owner. Override it if the new owner needs to resume state the previous owner was
tracking locally, like a running timer or an in-progress countdown: only synced fields
survive the handoff automatically.

## Lifecycle

Call `StartProcess()` to begin. It claims ownership for the local player if not already
owner, fires `OnProcessStarted()`, and schedules the tick loop. From there, either
`StopProcess()` or `CompleteProcess()` ends it. Both check whether the caller currently
has authority first: if not, the call is forwarded to the real owner over the network
instead of acting locally. `IsProcessRunning()` reports whether a process is currently
active.

Override points, all `protected virtual`, all no-ops by default, and **all invoked only on
the process owner** except `OnOwnerAbandonedProcess`:

| Hook | Fires when |
|---|---|
| `OnProcessStarted` | `StartProcess` succeeds |
| `OnProcessStopped` | `StopProcess` (or a forwarded `RequestStopProcess`) executes |
| `OnProcessCompleted` | `CompleteProcess` (or a forwarded `RequestCompleteProcess`) executes |
| `OnProcessCleanup(bool isCompleted)` | after stop or complete, once mandatory state is already reset; add subclass-specific cleanup here, no base call needed |
| `OnProcessUpdate` | every 0.5s while running, only if `StartProcess(useProcessUpdate: true)` was passed |
| `OnOwnerAbandonedProcess` | **on the new owner**, when ownership was taken over after the previous owner left or was suspended |

## Ownership and authority

A process has exactly one owner at a time, tracked two ways: a display-name-based ID
(`_ownerId`, used for `FindPlayerByID` lookups) and a numeric player ID
(`_ownerPlayerIdInt`). Comparing the numeric ID, not the string, is what
`IsProcessOwner()` actually does, since it avoids a string allocation.

`StopProcess`/`CompleteProcess` treat two things as sufficient authority to act locally:
being the recognized process owner, or simply holding VRChat's own [object
ownership](https://creators.vrchat.com/worlds/udon/networking/ownership/) of the
GameObject (`Networking.IsOwner`, layered on top of Unity by the VRChat SDK, not a
Unity feature itself). That second check exists for a specific timing window: right
after the previous owner leaves, VRChat has already handed you object ownership, but
the `_ownerId` field hasn't caught up yet, since that only updates once a
deserialization packet arrives.

Ownership recovery happens through three VRChat callbacks, layered to cover different
failure orderings:

- **[`OnPlayerLeft`](https://udonsharp.docs.vrchat.com/events/#udon-player-events)** — if
  the process is running and the leaving player was its owner *and* object ownership
  already transferred to the local client, takes over immediately.
- **[`OnOwnershipTransferred`](https://udonsharp.docs.vrchat.com/events/#udon-networking-events)**
  — a fallback for the case where `OnPlayerLeft` saw `IsOwner() == false` and did nothing
  (a [known engine ordering
  issue](https://feedback.vrchat.com/udon/p/order-of-onownershiptransferred-and-onplayerleft-when-another-player-leaves-the)
  where `OnOwnershipTransferred` can fire after `OnPlayerLeft` instead of before it).
  Also handles a suspended owner: if the named owner is gone or suspended and this client
  now holds object ownership, it takes over here instead.
- **[`OnPlayerSuspendChanged`](https://creators.vrchat.com/worlds/udon/graph/event-nodes/#onplayersuspendchanged)**
  — a suspended player can't run Udon code or receive network events, so a process they
  own would stall forever. Every non-suspended client reacts to this event by requesting
  ownership; VRChat picks one winner, and that winner's `OnOwnershipTransferred` then
  completes the takeover.

[`OnDeserialization`](https://udonsharp.docs.vrchat.com/events/#udon-networking-events)
adds a fourth recovery path, for manual sync's own failure mode. Because
[`RequestSerialization`](https://udonsharp.docs.vrchat.com/vrchat-api/#methods-5) packets
are queued rather than instantaneous, one from a just-departed or just-suspended owner
can arrive *after* a takeover already happened, overwriting `_ownerId` back to the old,
now-invalid owner. `OnDeserialization` detects this (local client holds object
ownership, the process is running, but the named owner is gone or suspended) and reasserts
ownership. It also unconditionally restarts the tick loop whenever this client is the
owner and the loop isn't currently running: a general safety net for "the loop went
silent and nothing else caught it."

## The tick loop and auto-resync

`StartProcess` schedules a self-rescheduling loop via
[`SendCustomEventDelayedSeconds`](https://udonsharp.docs.vrchat.com/vrchat-api/#methods-5),
not `Update()`. That's deliberate: Unity [never delivers
`Update()`](https://docs.unity3d.com/ScriptReference/GameObject.SetActive.html) to an
inactive GameObject or a disabled component, but a process needs to keep ticking even if
its GameObject is hidden. The loop runs unconditionally for every running, owned process
on a 0.5-second cadence, and only calls `OnProcessUpdate` if `useProcessUpdate: true` was
passed to `StartProcess`.

Independent of that, the loop re-broadcasts the object's full synced state via
`RequestSerialization` every 5 seconds while running: the auto-resync heartbeat. This
exists because [`[NetworkCallable]`](https://creators.vrchat.com/worlds/udon/networking/events/)
broadcasts (see `RequestStopProcess`/`RequestCompleteProcess` below) aren't
delivery-confirmed. A client that missed one self-heals within a few seconds via the
next resync, with no acknowledgement or retry logic needed anywhere.

The loop guards against stale scheduled calls with a real-time deadline
(`_nextTickDueAtRealTime`): `SendCustomEventDelayedSeconds` can't be canceled once
scheduled, so stopping and immediately restarting a process in the same frame can leave
an old loop's already-in-flight call pending. That call fires before the new deadline
and is discarded without rescheduling, so the stale chain dies on its own rather than
retrying.

## RequestStopProcess and RequestCompleteProcess

These are the
[`[NetworkCallable]`](https://creators.vrchat.com/worlds/udon/networking/events/#legacy-events-and-security)
targets a non-owner's `StopProcess`/`CompleteProcess` call forwards to, each
rate-limited to one call per second. Two things worth knowing before relying on them
directly:

- VRChat has no way to restrict who calls a `[NetworkCallable]` method: any player can
  invoke these directly. The owner-or-object-owner guard is the only check TsVRC
  applies; any further authorization is the subclass's responsibility.
- There's no per-run generation token. Calls beyond the rate limit are [queued, not
  dropped](https://creators.vrchat.com/worlds/udon/networking/events/#rate-limiting),
  and can arrive up to roughly a second late. That means a stale call arriving after
  the same owner has already stopped and started a brand new run is indistinguishable
  from a legitimate call for that new run, and incorrectly stops or completes it. If
  your world stops and restarts a process in quick succession, coordinate that at a
  level above `Process` itself.

## Known races, by design

Two races are documented on the methods themselves rather than solved internally,
because solving them requires a policy decision `Process` can't make on its own:

- **`StartProcess`** — if two clients call it before either's `RequestSerialization`
  packet arrives, both locally pass the "not already running" guard and both fire
  `OnProcessStarted`. One packet eventually wins via `OnDeserialization`, leaving the
  other client with a locally running process the network has already discarded.
  Protect against this at a higher level: for example, only ever call `StartProcess`
  from the instance master, or through a coordinated network event.
- **Reentrant stop-then-start** — if a listener reacts to
  `OnProcessStopped`/`OnProcessCompleted` by synchronously starting a new process,
  possible because [`SendCustomNetworkEvent(All, ...)` fires inline on the
  sender](https://creators.vrchat.com/worlds/udon/networking/events/#event-targeting),
  the internal cleanup step detects that `_isRunning` is already `true` again by the
  time it would run. It then skips clearing the owner/update fields and skips the
  `OnProcessCleanup` hook entirely, since both would otherwise clobber the new
  process's just-set state. This is handled correctly internally. It's listed here
  because it explains why `OnProcessCleanup` won't always fire after every
  stop/complete call if a listener restarts the process inline.
