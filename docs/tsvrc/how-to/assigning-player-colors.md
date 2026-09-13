---
id: assigning-player-colors
title: Give each player a unique color
sidebar_position: 10
---

# Give each player a unique color

How to give every player in the instance a distinct, stable color every client agrees on
(for markers, name tags, team indicators), using
[`PlayerColorAssigner`](../players-tracking/player-color-assigner).

## Steps

1. Add one `PlayerColorAssigner` to your scene. It never overrides `TsStart` and doesn't
   touch `_ts`, so there's no Configure registration step at all, just drop it in.
   Since it syncs a shuffled color order (`[UdonBehaviourSyncMode(BehaviourSyncMode.Manual)]`),
   it needs to be a real object present when the world starts rather than something you
   spawn later: manual placement, not Factory.
2. Call `Initialize()` once, from wherever your world does one-time setup, before the
   first `GetColor` call:

   ```csharp
   public class TeamMarkers : TsBehaviour
   {
       [SerializeField] private PlayerColorAssigner _colors;

       protected override void TsStart()
       {
           _colors.Initialize();
       }
   }
   ```

3. Look up a player's color wherever you need it, keyed by their `TsPlayer`-format ID:

   ```csharp
   public Color GetMarkerColor(VRCPlayerApi player) =>
       _colors.GetColor(TsPlayer.GetPlayerID(player));
   ```

If more than one behaviour needs matching colors, share this one instance (a Global or a
plain serialized reference) rather than adding a second `PlayerColorAssigner`. A second
instance would shuffle its own, independent order and disagree with the first about which
color belongs to which player.

## Why this shape

See [`PlayerColorAssigner`'s reference page](../players-tracking/player-color-assigner)
for why the palette is shuffled per instance instead of used in raw ID order, and why
`GetColor` is always safe to call even before `Initialize` has run anywhere.
