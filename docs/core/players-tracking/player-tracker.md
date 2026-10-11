---
id: player-tracker
title: PlayerTracker
sidebar_position: 2
---

# PlayerTracker

`Tsvrc.Tracking.PlayerTracker` is a [Process](../core-concepts/process) that keeps a networked set
of tracked players, managed by its owner and identified by [`TsPlayer`](./ts-player) ID strings
instead of live `VRCPlayerApi` references. Its generated shadow is `TsPlayerTracker`. See [Track a
custom group of players](../how-to/tracking-a-group-of-players) for a task-oriented walkthrough.

## Getting an instance

`PlayerTracker` is one of the [builtin pool entries](../explanations/builtin-registrations), so a
`[WirePool]` field of this type resolves with nothing to register, and codegen calls `TsConstruct`
on it. If you place the shipped `PlayerTracker` prefab in your scene yourself instead, call
[`TsConstruct`](../core-concepts/tsvrc-behaviour#construction) on it before using it.

## Usage

```csharp
public class SpectatorRoster : TsBehaviour
{
    [WirePool][SerializeField] private PlayerTracker _spectators;

    protected override void TsStart()
    {
        _spectators.TsSubscribe(this, PlayerTracker.OnTrackingPlayersAddedEvent, nameof(_OnRosterChanged));
        _spectators.TsSubscribe(this, PlayerTracker.OnTrackingPlayersRemovedEvent, nameof(_OnRosterChanged));
        _spectators.StartPlayerTracking(new string[0]);
    }

    public void AddSpectator(string playerId) => _spectators.AddTrackedPlayers(new[] { playerId });

    public void _OnRosterChanged() => LogInfo(_spectators.LastPlayerIds.Length + " spectators.");
}
```

## Starting and reading the tracked set

`StartPlayerTracking(playerIds, useProcessUpdate)` starts the process with an initial set. A player
who isn't the owner takes ownership first, so the tracker runs on the player who starts it. The list
is cleaned before use: `null` entries are removed and duplicates collapsed, so no ID appears twice
from the first broadcast on. Calling it while the tracker runs logs a warning and leaves both the
run and the pending initial list alone, so a rejected start can't change the set of the next one.

`LastPlayerIds` is the tracked set as of the last received broadcast or deserialization. Read it
inside an `OnTracking*` callback. `IsTrackedPlayer`, a `protected` helper for subclasses, reads the
synced field instead, which on a non-owner can lag behind a `Notify*` callback that just fired.

## Adding and removing players while running

`AddTrackedPlayers` and `RemoveTrackedPlayers` apply directly on the owner and send the call to the
owner from any other player. The change itself happens in `BroadcastAddTrackedPlayers` and
`BroadcastRemoveTrackedPlayers`. Both are `[NetworkCallable]`, so any player in the instance can
call them directly, and both check `IsProcessRunning() && IsProcessOwner()` themselves.

`BroadcastAddTrackedPlayers` also asks the `CanAcceptTrackedPlayerAdditions()` hook, `true` by
default. Override it to reject additions. It's the one place that sees both the local call on the
owner and a call from another player, since a
[`[NetworkCallable]`](https://creators.vrchat.com/worlds/udon/networking/events/#defining-an-event)
method can't be `virtual`.

Both broadcast methods skip IDs that don't apply (already tracked for an add, not tracked for a
remove) without an error, and remove duplicates from their own input, so passing the same ID twice
in one call never tracks or broadcasts it twice.

## Automatic removal

The owner removes a tracked player without a `RemoveTrackedPlayers` call in three cases:

- **`OnPlayerLeft`**: the player left while the tracker runs.
- **`OnPlayerSuspendChanged`**: the player was suspended. A suspended player can't run Udon or
  answer network events, so subclass logic that waits for every tracked player would block
  forever. Waking up needs nothing, since the player was already removed.
- **`OnBecameProcessOwner`**: the tracker changed owner during a run, for example because the
  previous owner left or was suspended. Only the owner removes players, so a tracked player who
  left or was suspended while the previous owner couldn't act is still in the set. The new owner
  checks the whole set against the players who are present and not suspended, and removes the
  rest.

## Events

Six `OnTracking*` hooks, `protected virtual` and empty by default, each paired with an
`OnTracking*Event` constant for `TsSubscribe`: `Started`, `Stopped`, `Completed`, `Deserialization`,
`PlayersAdded` and `PlayersRemoved`. The doc comment of each hook says which `Last*Ids` property to
read inside it.

The `Notify*` methods behind these events all allow 100 calls per second. VRChat keeps the order of
events from one sender [only while none of them hits its rate
limit](https://creators.vrchat.com/worlds/udon/networking/events/#rate-limiting), so a run of adds
and removes can't overtake a start, stop or complete broadcast on another client.

## Edge cases

- Each `Notify*` method cleans its own input again (removes `null` entries, then duplicates) and
  checks that the caller is the current owner, since any player can call a `[NetworkCallable]`
  method directly. The owner skips that caller check during its own broadcast, tracked by the
  internal `_isBroadcasting` flag.
- Synced fields and network events travel separately: [manual sync sends only when its own rate
  limit
  allows](https://creators.vrchat.com/worlds/udon/networking/network-details/#manual-synchronization),
  however often `RequestSerialization` is called, so either can arrive first.
  `NotifyTrackedPlayersAdded` adds to `LastPlayerIds` only the IDs it doesn't already hold.
