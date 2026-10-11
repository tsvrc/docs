---
id: ready-check-process
title: ReadyCheckProcess
sidebar_position: 4
---

# ReadyCheckProcess

`Tsvrc.Tracking.ReadyCheckProcess` is a [PlayerTracker](./player-tracker) that runs a ready check:
it tracks a fixed set of players and completes once every one of them has marked themselves ready.
Its generated shadow is `TsReadyCheckProcess`. See [Gate something on all players being
ready](../how-to/wiring-a-ready-check) for a task-oriented walkthrough.

## Getting an instance

`ReadyCheckProcess` is one of the [builtin pool entries](../explanations/builtin-registrations), so a
`[WirePool]` field of this type resolves with nothing to register, and codegen calls `TsConstruct`
on it. If you place the shipped `ReadyCheckProcess` prefab in your scene yourself instead, call
[`TsConstruct`](../core-concepts/tsvrc-behaviour#construction) on it before using it. Its `TsStart`
stores the ID of the local player, and without it `SetReady` can't mark the local player ready.

## Usage

`StartReadyCheck(playerIds)` starts tracking the given players through
`StartPlayerTracking(playerIds, useProcessUpdate: true)`, so the calling player becomes the owner
and the process update polls readiness. Each player calls `SetReady()` to mark themselves ready, or
`SetReady(false)` to take it back. The owner checks whether everyone is ready after each change and
on every 0.5-second tick, and calls `CompleteReadyCheck()` as soon as all tracked players are.
`StopReadyCheck()` ends the check early.

There are three events, following the `PlayerTracker` pattern: the `OnReadyCheckStarted`,
`OnReadyCheckStopped` and `OnReadyCheckCompleted` hooks, with matching `OnReadyCheck*Event`
constants for `TsSubscribe`. `IsPlayerReady(playerId)` checks the ready set, and the inherited
`LastPlayerIds` is the tracked set.

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

## Why SetReady doesn't check IsProcessRunning

`SetReady` checks an internal `_readyCheckActive` flag instead of `IsProcessRunning()`. Manual sync
sends synced fields [when its own rate limit
allows](https://creators.vrchat.com/worlds/udon/networking/network-details/#manual-synchronization),
independently of network events, so `SetReady` called from a network event handler can run before
the synced running state arrives, even though the start event already has. `_readyCheckActive`
follows the ordered `Notify*` events (`OnTrackingStarted`, `Stopped` and `Completed`) and is set in
two more places those events don't reach:

- **`OnTrackingDeserialization`**: [network events aren't replayed to players who join
  later](https://creators.vrchat.com/worlds/udon/networking/late-joiners/), so a late joiner never
  gets the start event. The flag follows the synced running state on every deserialization instead.
- **`OnBecameProcessOwner`**: a player who becomes the owner before receiving the start event or a
  packet would keep the flag `false`, and an owner never deserializes its own packets. The flag
  follows the running state here too, so the new owner can still mark itself ready.

A `SetReady` call while `_readyCheckActive` is `false` logs a warning locally and sends nothing, so
a flag stuck by a missed broadcast leaves no trace on any other client.

## Ownership and changes to the ready set

Only the copy of the ready set on the owner counts. Unlike the tracked set, it has no `Notify*`
broadcast, so `IsPlayerReady` on another player reflects only the last packet received.

`SetReady` changes the set directly on the owner. Any other player sends the change to the owner
through `BroadcastAddReadyPlayer` or `BroadcastRemoveReadyPlayer`. Both are `[NetworkCallable]` and
limited to two calls per second, since VRChat [recommends keeping that limit as low as the use case
allows](https://creators.vrchat.com/worlds/udon/networking/events/#rate-limiting). Both reject a
call that marks anyone other than the caller:
[`NetworkCalling.CallingPlayer`](https://creators.vrchat.com/worlds/udon/networking/events/#accessing-the-sender-of-an-event)
must match the `playerId` argument. It's `null` for a direct local call, which skips the check.

An internal `RemoveReadyPlayerInternal` changes the set without going through the network for a
player who leaves or is removed, and for the owner calling `SetReady(false)`. VRChat keeps
`CallingPlayer` set to the sender of the outermost network call for the whole call chain, so calling
`BroadcastRemoveReadyPlayer` from the handler of a network event sent by another player would carry
that player as the caller and fail the check above.

## Edge cases

- A check with no tracked players never completes on its own: completion needs at least one
  tracked player, and every one of them ready. That holds for a check started with an empty list
  and for one whose tracked players all left. Stop it with `StopReadyCheck()`.
- A ready mark from a player who isn't tracked is rejected with a warning. `CheckAllPlayersReady`
  only looks at tracked players, so that mark could never affect completion.
- `OnTrackingPlayersRemoved` can remove up to 79 players at once when a new owner takes over, one
  below the [80-player instance cap](https://wiki.vrchat.com/wiki/Special:MyLanguage/Instances). It
  removes them from the ready set in one pass with one array allocation.
- Removing a player who isn't ready can complete the check: if everyone left is ready,
  `OnTrackingPlayersRemoved` completes it right after the removal.
