---
id: auto-player-tracker
title: AutoPlayerTracker
sidebar_position: 3
---

# AutoPlayerTracker

`Tsvrc.Tracking.AutoPlayerTracker` is a [PlayerTracker](./player-tracker) that tracks
every player in the instance automatically: no explicit player list to manage. Its
generated shadow is `TsAutoPlayerTracker`.

## Getting an instance

`AutoPlayerTracker` ships as one of TsVRC's own default pool entries (`TsBuiltinConfig`).

- **Default:** a `[WirePool]` field of this type just resolves, nothing to register in
  Configure first, and codegen calls `TsConstruct` for you at wire time.
- **Manual:** skip pooling entirely. Drag the shipped `AutoPlayerTracker` prefab into your
  scene and call `TsConstruct` on it yourself before calling anything else on it. Skipping
  construction leaves [`Process`'s cached local-player ID](../core-concepts/process) at
  its default, which makes `IsProcessOwner()` report `false` even for the actual owner.

## Usage

Call `StartAutoTracking()` instead of `StartPlayerTracking`. The base method is
overridden to redirect to the automatic snapshot regardless of what's passed to it, and
both of its parameters (`playerIds`, `useProcessUpdate`) are ignored entirely;
`AutoPlayerTracker` never uses the process-update loop.
`StopAutoTracking()`/`CompleteAutoTracking()` are thin renames of the base
`StopPlayerTracking`/`CompletePlayerTracking`.

From there, it's genuinely automatic: on the process owner, every `OnPlayerJoined` while
the process is running adds that player. VRChat player references [can be
invalid](https://creators.vrchat.com/worlds/udon/players/#isvalid), and accessing one
that is has been reported to throw and crash the behaviour, so the join is skipped
whenever the reference fails that check. Every departure or suspension is removed
through the same paths `PlayerTracker` already provides. Non-owners don't act on
`OnPlayerJoined` at all: there's no local add to forward, since only the owner's copy of
the tracked set is authoritative.

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

No add/remove calls of your own: join and leave are handled entirely by the base
`PlayerTracker` machinery once `StartAutoTracking()` has run.

## The initial-snapshot timing

The player list `StartAutoTracking` captures is read at the moment `StartAutoTracking`
is called, not inside `OnPlayerJoined`. This matters because of how VRChat handles the
local player's own join: [joining an instance fires `OnPlayerJoined` for every player
already present, including
yourself](https://creators.vrchat.com/worlds/udon/graph/event-nodes/#onplayerjoined).
That entire wave fires before any of your own code has run, so `IsProcessRunning()` is
still `false` for all of it, and every one of those events is dropped. By the time
`StartAutoTracking` actually runs, that wave is long gone; reading the live player list
at that instant is what captures everyone who's genuinely present. A player who is
still mid-join at that exact instant hasn't fired their own `OnPlayerJoined` yet. It
fires afterward, once the process is live, and gets picked up normally through the
ordinary join path. Because UdonSharp runs on Unity's single main thread, no
`OnPlayerJoined` can interleave between reading that snapshot and the process actually
going live, so there's no window where a joining player is missed by both paths.

The snapshot itself excludes any player already suspended at that instant. A player
who's suspended before tracking even starts has no suspend *transition* left to
produce, and `PlayerTracker`'s own suspend-handling only reacts to that transition, so a
pre-suspended player must never enter the tracked set in the first place.

## Events

Same six lifecycle names as `PlayerTracker`, renamed with an `Auto` prefix
(`OnAutoTrackingStarted`, `...Stopped`, `...Completed`, `...Deserialization`,
`...PlayersAdded`, `...PlayersRemoved`) and their matching `OnAutoTracking*Event`
constants. Each is just the base `OnTracking*` hook overridden to emit the renamed
event. The underlying data (`LastPlayerIds`, `LastAddedPlayerIds`,
`LastRemovedPlayerIds`) is identical to `PlayerTracker`'s own.
