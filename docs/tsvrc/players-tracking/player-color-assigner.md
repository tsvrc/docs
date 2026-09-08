---
id: player-color-assigner
title: PlayerColorAssigner
sidebar_position: 5
---

# PlayerColorAssigner

`Tsvrc.Player.PlayerColorAssigner` assigns every player a stable, visually distinct color
from an 82-entry palette (VRChat's hard per-instance player cap), keyed off their numeric
player ID so every client independently resolves the same color for the same player with no
per-lookup network traffic.

## Usage

Call `Initialize()` once per instance start, before any `GetColor` call. Multiple consumers
that need matching colors should share one `PlayerColorAssigner` instance rather than each
deriving their own — the whole point of the synced shuffle order is that everyone agrees.

```csharp
assigner.Initialize();
Color c = assigner.GetColor(TsPlayer.GetPlayerID(somePlayer));
```

## Why the palette is shuffled, and how

A player's raw color slot is just their numeric player ID modulo the palette size — cheap
and deterministic, but it means the *n*th player to ever join any instance always gets the
same slot, so two friends who happen to join in the same relative order across sessions
always see the same two colors paired together. `Initialize` fixes that by generating a
random permutation of palette indices (a synced `byte[] _order`) once per instance, so the
same raw slot maps to a different actual color each session. Only the owner actually
shuffles and broadcasts it — a non-owner's own `Initialize` call just ensures a sane
identity-order default (`_order[i] = i`) is in place locally until the owner's real order
arrives, so `GetColor` is never called against an uninitialized array.

## Edge cases worth knowing

- `GetColor` never throws: an empty or missing palette returns `Color.white`, and a
  numeric ID that doesn't parse (see [`TsPlayer.GetNumericPlayerId`](./ts-player))
  simply resolves to slot `0`.
- Calling `GetColor` before `Initialize` (or before the owner's synced order has arrived)
  is safe — the palette-index modulo alone still produces a color, just not yet the
  session-shuffled one.
- The palette itself is a fixed, hand-tuned hue sweep (two passes around the color wheel at
  alternating saturation/value) chosen for maximum distinctness between adjacent slots, not
  a generated gradient — changing its length changes the modulo divisor for every ID.
