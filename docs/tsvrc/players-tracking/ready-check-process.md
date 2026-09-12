---
id: ready-check-process
title: ReadyCheckProcess
sidebar_position: 4
---

# ReadyCheckProcess

`Tsvrc.Tracking.ReadyCheckProcess` is a [PlayerTracker](./player-tracker) that runs a ready
check: it tracks a fixed set of players and completes automatically once every one of them
has marked themselves ready. Its generated shadow is `TsReadyCheckProcess`.

## Getting an instance

`ReadyCheckProcess` ships as one of TsVRC's own default pool entries (`TsBuiltinConfig`).

- **Default:** a `[WirePool]` field of this type just resolves, nothing to register in
  Configure first, and codegen calls `TsConstruct` for you at wire time.
- **Manual:** skip pooling entirely. Drag the shipped `ReadyCheckProcess` prefab into your
  scene and call `TsConstruct` on it yourself before calling anything else on it. Skipping
  construction leaves [`Process`'s cached local-player ID](../core-concepts/process) at
  its default, which makes `IsProcessOwner()` report `false` even for the actual owner.

## Usage

`StartReadyCheck(playerIds)` starts tracking the given players. Internally, this calls
`StartPlayerTracking(playerIds, useProcessUpdate: true)`: the process-update loop is what
polls readiness. Any player calls `SetReady()` (or `SetReady(false)` to un-ready) to toggle
their own status; the owner polls whether everyone is ready both immediately after each
change and on every 0.5s process tick, and calls `CompleteReadyCheck()` as soon as all
tracked players are ready. `StopReadyCheck()` ends it early without requiring everyone
ready.

Three events, matching the usual `PlayerTracker` pattern: `OnReadyCheckStarted`,
`OnReadyCheckStopped`, `OnReadyCheckCompleted` (hooks) with matching `OnReadyCheck*Event`
constants for `TsSubscribe`. `IsPlayerReady(playerId)` checks the current ready set,
`LastPlayerIds` (inherited) is the tracked set.

```csharp
public class LoadingGate : TsBehaviour
{
    [WirePool][SerializeField] private ReadyCheckProcess _readyCheck;

    protected override void TsStart()
    {
        _readyCheck.TsSubscribe(this, ReadyCheckProcess.OnReadyCheckCompletedEvent, nameof(_OnEveryoneReady));
    }

    public void BeginLoadGate(string[] participantIds) => _readyCheck.StartReadyCheck(participantIds);

    // Call once this client has finished whatever it was waiting on.
    public void FinishedLoading() => _readyCheck.SetReady();

    public void _OnEveryoneReady() => LogInfo("Everyone is ready, continuing.");
}
```

## Why SetReady doesn't just check IsProcessRunning

`SetReady` gates on an internal `_readyCheckActive` flag instead of `IsProcessRunning()`.
The reason is a real ordering gap: VRChat's manual sync only serializes and delivers
synced fields once its own rate limit allows, on a timeline independent of discrete
network events, so calling `SetReady` from inside a network event handler can run before
the synced `_isRunning` field has actually arrived, even though the corresponding
"process started" event already has. `_readyCheckActive` is instead driven directly by
the ordered `Notify*` events (`OnTrackingStarted`/`Stopped`/`Completed`) and corrected in
two more places for cases those events can't reach on their own:

- **`OnTrackingDeserialization`** — a late joiner never receives the original
  `NotifyTrackedPlayersProcessStarted` broadcast. [Network events aren't replayed to
  players who join after they
  fire](https://creators.vrchat.com/worlds/udon/networking/late-joiners/), so this derives
  the flag from the now-current synced `_isRunning` instead, on every deserialization.
- **`OnOwnerAbandonedProcess`** — a client that becomes the new owner via takeover, without
  having previously received either the start event or a deserialization, would otherwise be
  stuck with `_readyCheckActive` still at its default `false` forever (a client never
  receives `OnDeserialization` for a packet its own `RequestSerialization` produced). This
  applies the same derivation as the deserialization case, specifically so the new owner
  isn't permanently unable to call `SetReady` on itself.

A `SetReady` call that arrives while `_readyCheckActive` is `false` is rejected with a
local-only warning. It never reaches the network, so a stuck flag from a genuinely missed
broadcast fails silently rather than producing any trace elsewhere.

## Ownership and mutation

Only the owner's copy of the ready set is authoritative; there's no `Notify*` broadcast for
individual ready/unready changes the way there is for the tracked set, so
`IsPlayerReady` on a non-owner reflects only the last deserialized snapshot; it's never
otherwise kept current. `SetReady` mutates directly when called on the owner and forwards to
the owner via `BroadcastAddReadyPlayer`/`BroadcastRemoveReadyPlayer` (each
`[NetworkCallable]`, rate-limited to 2/second: VRChat [recommends keeping
caller-invocable methods' rate as low as the use case
allows](https://creators.vrchat.com/worlds/udon/networking/events/#rate-limiting), and
toggling ready a couple of times per check is all that's ever actually needed) otherwise.
Both broadcast targets check that the caller is only ever marking *themselves* ready or
unready:
[`NetworkCalling.CallingPlayer`](https://creators.vrchat.com/worlds/udon/networking/events/#accessing-the-sender-of-an-event),
which is `null` for a direct local call (so the check is skipped then) but set to the
real calling player for a genuine network call, must match the `playerId` argument or the
call is rejected.

An internal `RemoveReadyPlayerInternal` bypasses the network-callable path entirely for a
few cases (a player leaving/being removed, or the owner calling `SetReady(false)` on
itself), not for convenience, but because VRChat keeps `CallingPlayer` set to the
*original, outermost* network call's sender for the entire duration of a call chain.
Calling `BroadcastRemoveReadyPlayer` from inside a handler that's itself already running
as part of a different player's network event would carry that other player's identity
as `CallingPlayer`, which is exactly the spoofing case the self-only guard exists to
catch. Removal in that situation mutates `_readyPlayerIds` directly instead, having
already validated the target player through other means.

## Edge cases worth knowing

- An untracked player's ready mark is rejected with a warning rather than silently
  accepted. `CheckAllPlayersReady` only ever consults the tracked player list, so an
  untracked player's ready status would otherwise never actually influence completion,
  with no indication why.
- Removing several tracked players at once (`OnTrackingPlayersRemoved`, which can remove
  up to 79 players in one call via `OnOwnerAbandonedProcess`, one below [VRChat's 80-player
  hard cap per
  instance](https://wiki.vrchat.com/wiki/Special:MyLanguage/Instances)) batches the
  corresponding ready-list removal into one pass and one array allocation rather than one
  `TsArray.Remove` call per player.
- Removing a not-yet-ready player from tracking can itself complete the check: if the
  remaining tracked players are all already ready, `OnTrackingPlayersRemoved` re-checks
  completion immediately after the removal.
