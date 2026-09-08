---
id: player-position-overlay
title: PlayerPositionOverlay
sidebar_position: 4
---

# PlayerPositionOverlay

`Tsvrc.UI.PlayerPositionOverlay` is a [PlayerTracker](../players-tracking/player-tracker) that
periodically reports each tracked player's world position on a blinking show/hide cycle —
think a radar sweep or a minimap that pulses rather than staying static. Its generated
shadow is `TsPlayerPositionOverlay`. It's a pure backend: it never draws anything itself,
only reports positions to a pluggable [`PlayerMarkerRenderer`](./player-marker-renderer).
Everything about rendering is local and unsynced — each client runs its own independent tick
loop and decides its own presentation.

## Usage

```csharp
overlay.Renderer = someRendererInstance;
overlay.StartOverlay(playerIds);
// ... AddTrackedPlayers/RemoveTrackedPlayers to change the set while running ...
overlay.StopOverlay();
```

Subscribe to `OnOverlayUpdatedEvent` to react after every cycle (both a show and a hide
count as a cycle, so this fires roughly twice per blink period).

## Two independent tick loops

- **The remote tick** (`RemoteUpdateInterval`, default 0.3s) resolves every tracked player
  ID to a live `VRCPlayerApi` and caches its position, heading, and identity. It never
  touches the renderer directly.
- **The blink tick** (`MarkerOnDuration`/`MarkerOffDuration`) alternates between presenting
  every cached position through `Renderer.OnMarkerVisible` and presenting nothing, always
  finishing with exactly one `Renderer.OnPresent()` call per cycle regardless of how many
  markers were shown.

Splitting these two matters for cost: resolving player IDs to live references and reading
positions happens only once per `RemoteUpdateInterval`, not once per blink transition, and
`Renderer.UsesHeading` gates a `GetRotation()` call (a comparatively expensive
quaternion-to-Euler conversion) so a renderer that never uses heading never pays for it.

The local player is the one exception to "everything comes from the cache": it's re-read
fresh at blink-show time from `Networking.LocalPlayer`, rather than through the cached
remote-tick snapshot, since the local player's own position is essentially free to read and
benefits from being as current as possible.

## Stale-tick discarding

Both tick loops use `SendCustomEventDelayedSeconds`, which (like elsewhere in the codebase)
can't be canceled once scheduled. Each maintains its own counter, incremented on every
schedule and decremented on every fire; a tick only actually runs its body if its counter has
returned to zero, meaning no newer tick of the same kind is already queued behind it. This is
what makes `StartOverlay`/`StopOverlay`/`OnTrackingDeserialization` restarting the loop
mid-flight safe — an old, now-superseded tick fires, sees a nonzero counter, and does
nothing.

## Buffers are pre-sized to VRChat's own cap

Every internal buffer (cached positions, headings, player IDs, live player references) is
sized to 82 — VRChat's hard per-instance player cap — allocated once, lazily, on first use,
and reused every tick rather than reallocated. `_ResolveTrackedPlayers` is zero-allocation
by design: matching happens by comparing each tracked ID's parsed numeric suffix directly
against `VRCPlayerApi.playerId`, never by calling
[`TsPlayer.GetPlayerID`](../players-tracking/ts-player) to build a comparison string per player. A
malformed tracked ID (no parseable numeric suffix) is skipped rather than causing an error.
