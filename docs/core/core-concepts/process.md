---
id: process
title: Process
sidebar_position: 4
---

# Process

`Tsvrc.Core.Process` is the base class for networked work that one player runs at a time: it
starts, runs, then stops or completes. That player is the owner, and another player takes over if
the owner leaves or is suspended. Its generated shadow is `TsProcess`. `PlayerTracker`,
`AutoPlayerTracker`, `ReadyCheckProcess`, `TsvrcTimer` and the `DataTransferer` chain all extend it.

## Usage

Subclass the generated shadow and override the hooks you need:

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

Any player can call the lifecycle methods. The owner runs the call, and any other player sends it to
the owner over the network:

```csharp
gameRound.StartProcess();
// ...later, from any player:
gameRound.CompleteProcess();
```

## Lifecycle

`StartProcess(useProcessUpdate)` starts a run on the owner. It marks the process running, calls
`OnProcessStarted`, sends the synced state and starts the [tick loop](#the-tick-loop). On any other
player it sends `RequestStartProcess` to the owner and changes nothing locally. It never changes who
owns the object. A subclass that should run on the player who starts it calls `SetProcessOwner`
first, as `TsvrcTimer.StartTimer` and `PlayerTracker.StartPlayerTracking` do. If two players start
such a subclass at the same time, both can take ownership and start a run before either sees the
other, and only one stays the owner, so start it from one player when that can happen.

`StopProcess()` ends a run early and `CompleteProcess()` ends it successfully. The owner acts on
them directly, and any other player sends `RequestStopProcess` or `RequestCompleteProcess` to the
owner. `IsProcessRunning()` reports whether a run is active. Starting a process that's already
running, or stopping or completing one that isn't, logs a warning and does nothing.

The hooks are all `protected virtual` and empty by default:

| Hook | Runs on | When |
|---|---|---|
| `OnProcessStarted` | Owner | A run starts, before its first packet goes out, so synced fields set here are in that packet |
| `OnProcessStopped` | Owner | `StopProcess` ends the run |
| `OnProcessCompleted` | Owner | `CompleteProcess` ends the run |
| `OnProcessCleanup(bool isCompleted)` | Owner | After either of the two above, before the cleanup packet goes out. Clear the synced state of your subclass here |
| `OnProcessUpdate` | Owner | About every 0.5 seconds while running, if the run started with `useProcessUpdate: true` |
| `OnBecameProcessOwner` | New owner | The local player becomes the owner while a run is going, see [Taking over a run](#taking-over-a-run) |

`OnProcessCleanup` is skipped when a new run starts from inside `OnProcessStopped` or
`OnProcessCompleted`, because it would clear the state the new run just set. That happens when a
subclass broadcasts its stop with `SendCustomNetworkEvent(All, ...)`, which [runs on the sender
right away](https://creators.vrchat.com/worlds/udon/networking/events/#event-targeting), and a
listener starts the process again.

## Ownership

The owner of a process is the [VRChat owner](https://creators.vrchat.com/worlds/udon/networking/ownership/)
of its GameObject. Subclasses read and change it with three `protected` methods:

- `IsProcessOwner()` checks whether the local player is the owner.
- `IsProcessOwnedBy(player)` checks whether `player` is the owner.
- `SetProcessOwner(newOwner)` calls `Networking.SetOwner` and sends nothing itself. Don't write
  synced fields right after it: the old owner [has to acknowledge the
  transfer](https://udonsharp.docs.vrchat.com/networking-tips-&-tricks/#known-issues) first, which
  can take a few seconds.

## Taking over a run

A run keeps going when its owner can no longer drive it:

- When the owner leaves, [VRChat picks a new
  owner](https://creators.vrchat.com/worlds/udon/networking/ownership/#how-ownership-works). That
  player takes over from `OnPlayerLeft` or `OnOwnershipTransferred`, whichever runs once it owns the
  object. The two [can fire in either
  order](https://feedback.vrchat.com/udon/p/order-of-onownershiptransferred-and-onplayerleft-when-another-player-leaves-the).
- When the owner is [suspended](https://creators.vrchat.com/worlds/udon/players/#get-issuspended),
  their client stops running Udon and answering network events, so nothing would drive the run.
  Every client that sees the suspension in `OnPlayerSuspendChanged` calls `SetProcessOwner` for its
  own player, and the one that ends up owning the object takes over.

Taking over calls `OnBecameProcessOwner`, then restarts the tick loop. It happens once per handoff,
even when both callbacks see it. It also happens for a handoff made on purpose, such as a subclass
calling `SetProcessOwner` during a run. Only synced fields reach the new owner, so override
`OnBecameProcessOwner` to rebuild anything the previous owner kept in unsynced fields.

## The tick loop

While a process runs, its owner runs a loop scheduled with
[`SendCustomEventDelayedSeconds`](https://udonsharp.docs.vrchat.com/vrchat-api/#methods-5) every 0.5
seconds. Each tick calls `OnProcessUpdate` if the run asked for it. Every 5 seconds it also calls
`RequestSerialization`, which sends every synced field again, those of subclasses included, so a
client that missed a network event still gets the current synced state within a few seconds.

The loop stops when the run ends or the local player stops being the owner, including when
`OnProcessUpdate` ends the run. If the owner receives a packet while the
process runs and the loop isn't running, `OnDeserialization` starts it again.

## The request methods

`RequestStartProcess(bool useProcessUpdate)`, `RequestStopProcess(int requestedGeneration)` and
`RequestCompleteProcess(int requestedGeneration)` are the
[`[NetworkCallable]`](https://creators.vrchat.com/worlds/udon/networking/events/#legacy-events-and-security)
methods a non-owner call sends to the owner. They're public, so any player in the instance can call
them directly, and the owner checks each one:

- The local player must be the owner, and the process must be stopped for a start or running for a
  stop or complete.
- Stop and complete carry the run number the caller saw. Each start increases the synced run
  number, and the owner rejects a request whose number doesn't match the current run.
- Each method is rate-limited to one call per second. VRChat [queues calls over that
  rate](https://creators.vrchat.com/worlds/udon/networking/events/#rate-limiting) instead of
  dropping them, so a stop sent during one run can arrive after the next one started. The run number
  is what rejects it.

A rejected request logs a warning on the owner and does nothing else. Who may start or stop a
process beyond that is up to the subclass.
