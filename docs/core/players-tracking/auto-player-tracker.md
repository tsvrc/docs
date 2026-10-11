---
id: auto-player-tracker
title: AutoPlayerTracker
sidebar_position: 3
---

# AutoPlayerTracker

`Tsvrc.Tracking.AutoPlayerTracker` is a [PlayerTracker](./player-tracker) that tracks every player in
the instance, with no player list to manage. Its generated shadow is `TsAutoPlayerTracker`. See
[Track a custom group of players](../how-to/tracking-a-group-of-players) for when to use it instead
of a plain `PlayerTracker`, or [Gate something on all players being
ready](../how-to/wiring-a-ready-check) for pairing it with `ReadyCheckProcess`.

## Getting an instance

`AutoPlayerTracker` is one of the [builtin pool entries](../explanations/builtin-registrations), so a
`[WirePool]` field of this type resolves with nothing to register, and codegen calls `TsConstruct`
on it. If you place the shipped `AutoPlayerTracker` prefab in your scene yourself instead, call
[`TsConstruct`](../core-concepts/tsvrc-behaviour#construction) on it before using it.

## Usage

Call `StartAutoTracking()`. Like `StartPlayerTracking` on the base class, it makes the calling player
the owner first. `StartPlayerTracking` itself is overridden to do the same as `StartAutoTracking`
and ignores both of its parameters, since `AutoPlayerTracker` never uses the process update.
`StopAutoTracking()` and `CompleteAutoTracking()` call `StopPlayerTracking` and
`CompletePlayerTracking`.

While tracking runs, the owner adds each player who joins in `OnPlayerJoined`. A join is skipped
when the player reference [isn't valid](https://creators.vrchat.com/worlds/udon/players/#isvalid),
since accessing an invalid reference has been reported to crash the behaviour. Players who leave or
are suspended are removed the same way as in `PlayerTracker`. Other players ignore `OnPlayerJoined`,
because only the owner changes the tracked set.

```csharp
public class InstanceRoster : TsBehaviour
{
    [WirePool][SerializeField] private AutoPlayerTracker _tracker;

    protected override void TsStart()
    {
        _tracker.TsSubscribe(this, AutoPlayerTracker.OnAutoTrackingPlayersAddedEvent, nameof(_OnRosterChanged));
        _tracker.TsSubscribe(this, AutoPlayerTracker.OnAutoTrackingPlayersRemovedEvent, nameof(_OnRosterChanged));
        _tracker.StartAutoTracking();
    }

    public void _OnRosterChanged() => LogInfo(_tracker.LastPlayerIds.Length + " players in the instance.");
}
```

## When the first list is read

`StartAutoTracking` reads the player list when it's called, not in `OnPlayerJoined`. [Joining an
instance fires `OnPlayerJoined` for every player already
present](https://creators.vrchat.com/worlds/udon/graph/event-nodes/#onplayerjoined), the local
player included, and that wave fires before any of your code runs. The tracker isn't running yet,
so it drops all of those events, and the list read at start is what covers those players.

A player still joining at that moment fires `OnPlayerJoined` later, once tracking runs, and is added
then. UdonSharp runs on the Unity main thread only, so no `OnPlayerJoined` can run between reading
the list and the start of tracking, and no joining player is missed.

The first list leaves out players who are already suspended. `PlayerTracker` removes a player when
they become suspended, so a player who is suspended before tracking starts would never be removed.

## Events

The same six events as `PlayerTracker`, with an `Auto` prefix: `OnAutoTrackingStarted`, `Stopped`,
`Completed`, `Deserialization`, `PlayersAdded` and `PlayersRemoved`, each with an
`OnAutoTracking*Event` constant. Each one overrides the matching `OnTracking*` hook to emit the
renamed event. Read `LastPlayerIds`, `LastAddedPlayerIds` and `LastRemovedPlayerIds` as on
`PlayerTracker`.
