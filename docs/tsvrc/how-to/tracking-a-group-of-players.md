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

Reach for `AutoPlayerTracker` first if the roster really is "every player currently in
the instance": it needs no add/remove calls of your own. Use a bare `PlayerTracker`
instead when the roster is a subset you decide, players entering a specific area,
opting into a queue, being invited to a team, since `AutoPlayerTracker` always tracks
everyone and can't be told to track less.

## Steps

1. Declare a `[WirePool]` field. `PlayerTracker` ships as [one of TsVRC's own default pool
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

3. Read the roster from `LastPlayerIds` inside any `OnTracking*` callback. It's a synced,
   owner-managed set: a non-owner's `AddTrackedPlayers`/`RemoveTrackedPlayers` calls
   forward to the current owner over the network rather than applying locally.

## Why this shape

See [`PlayerTracker`'s reference page](../players-tracking/player-tracker) for the full
event table, exactly when a `Notify*` broadcast fires versus when `LastPlayerIds` itself
updates, and the three separate paths that remove a player automatically (leaving,
suspending, or the tracker's own owner abandoning it).
