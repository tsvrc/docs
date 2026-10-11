---
id: tracking-a-group-of-players
title: Track a custom group of players
sidebar_position: 8
---

# Track a custom group of players

How to maintain a synced roster of players for something narrower than "everyone in the
instance", using [`PlayerTracker`](../players-tracking/player-tracker) directly instead of
[`AutoPlayerTracker`](../players-tracking/auto-player-tracker).

## When to use which

Use `AutoPlayerTracker` when the roster is every player in the instance: it needs no add or remove
calls of your own. Use a plain `PlayerTracker` when the roster is a subset you decide, such as
players in an area, in a queue or on a team, since `AutoPlayerTracker` always tracks everyone.

## Steps

1. Declare a `[WirePool]` field. `PlayerTracker` ships as [one of the Core default pool
   entries](../explanations/builtin-registrations), so there's nothing to register on the
   Configure window first:

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

       public void _OnRosterChanged() => LogInfo(_spectators.LastPlayerIds.Length + " spectators.");
   }
   ```

2. Add or remove players as your own logic decides, for example when a player enters or
   leaves a trigger volume:

   ```csharp
   public override void OnPlayerTriggerEnter(VRCPlayerApi player)
   {
       _spectators.AddTrackedPlayers(new[] { TsPlayer.GetPlayerID(player) });
   }

   public override void OnPlayerTriggerExit(VRCPlayerApi player)
   {
       _spectators.RemoveTrackedPlayers(new[] { TsPlayer.GetPlayerID(player) });
   }
   ```

   A player who leaves the instance or gets suspended is removed automatically; you never
   need to handle that yourself.

3. Read the roster from `LastPlayerIds` inside any `OnTracking*` callback. The owner manages the
   set: `AddTrackedPlayers` and `RemoveTrackedPlayers` called by another player go to the owner
   over the network.

## Why this shape

See the [`PlayerTracker` reference page](../players-tracking/player-tracker) for the events, when a
`Notify*` broadcast fires compared to when `LastPlayerIds` updates, and the three cases that remove
a player automatically: leaving, being suspended, or a new owner taking over the tracker.
