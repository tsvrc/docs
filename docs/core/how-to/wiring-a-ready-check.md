---
id: wiring-a-ready-check
title: Gate something on all players being ready
sidebar_position: 1
---

# Gate something on all players being ready

How to block an action until every present player has confirmed they're ready, using
[`AutoPlayerTracker`](../players-tracking/auto-player-tracker) to know who's present and
[`ReadyCheckProcess`](../players-tracking/ready-check-process) to track their ready state.

## Steps

1. Declare a `[WirePool]` field for each. Both ship as [the Core default pool
   entries](../explanations/builtin-registrations), so there's nothing to register on the
   Configure window first, and codegen calls `TsConstruct` for you at wire time:

   ```csharp
   public class MatchStarter : TsBehaviour
   {
       [WirePool][SerializeField] private AutoPlayerTracker _roster;
       [WirePool][SerializeField] private ReadyCheckProcess _readyCheck;

       protected override void TsStart()
       {
           _roster.StartAutoTracking();
           _roster.TsSubscribe(this, AutoPlayerTracker.OnAutoTrackingPlayersAddedEvent, nameof(_OnRosterChanged));
       }

       public void _OnRosterChanged()
       {
           if (!_readyCheck.IsProcessRunning())
           {
               _readyCheck.StartReadyCheck(_roster.LastPlayerIds);
           }
       }
   }
   ```

2. Subscribe to completion and act on it:

   ```csharp
   protected override void TsStart()
   {
       // ...continued from above
       _readyCheck.TsSubscribe(this, ReadyCheckProcess.OnReadyCheckCompletedEvent, nameof(_OnEveryoneReady));
   }

   public void _OnEveryoneReady() => StartMatch();
   ```

3. Wherever your own UI lets a player mark themselves ready, call
   `_readyCheck.SetReady()` (or `SetReady(false)` to take it back). It only changes the status of
   the calling player, see [the reference
   page](../players-tracking/ready-check-process#ownership-and-changes-to-the-ready-set) for why.

## Handling the roster changing mid-check

A player who leaves or is suspended is [removed from the check
automatically](../players-tracking/player-tracker#automatic-removal). To include a player who
joins while the check runs, add them to it. They start out not ready:

```csharp
public void _OnRosterChanged()
{
    if (_readyCheck.IsProcessRunning())
    {
        _readyCheck.AddTrackedPlayers(_roster.LastAddedPlayerIds);
        return;
    }

    _readyCheck.StartReadyCheck(_roster.LastPlayerIds);
}
```

Restarting the check with the current roster also works, but clears every ready mark.

For a fixed, known set of players instead of everyone in the instance, start the ready check with
that ID list and skip `AutoPlayerTracker`.

Declare each `[WirePool]` field exactly once in the whole project if you want one shared
roster and ready check. [Pool slot counts are computed per
type](../codegen/modules/pool-module#how-many-slots-a-dependency-graph-not-a-flat-count):
a second `[WirePool] private ReadyCheckProcess` field somewhere else allocates a second,
independent instance rather than sharing this one. Reach the same instance from another
behaviour with an ordinary serialized reference or a Global, not a second `[WirePool]`
field of the same type.

## Why this shape

See the [`ReadyCheckProcess` reference page](../players-tracking/ready-check-process) for the
ordering of `SetReady` and what happens when the tracked set changes during a check. For the "why
generated code, why not just call these directly at compile time" background, see
[How Core fits together](../core-concepts/how-it-fits-together).
