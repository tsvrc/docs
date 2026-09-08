---
id: player-marker-renderer
title: PlayerMarkerRenderer
sidebar_position: 5
---

# PlayerMarkerRenderer

`Tsvrc.UI.PlayerMarkerRenderer` is the pluggable presentation strategy a
[`PlayerPositionOverlay`](./player-position-overlay) reports positions to. The overlay only
ever decides *when* and *where*; this class (or a subclass of it) decides what a marker
actually looks like and how it's drawn. It's a plain, non-`abstract` base with empty-bodied
virtual methods, deliberately — an overlay with `Renderer` unassigned, or a subclass that
only overrides one of the two methods, never crashes.

## Overriding it

```csharp
public class MyRenderer : PlayerMarkerRenderer
{
    public override bool UsesHeading => false; // skip the overlay's rotation read if unneeded

    public override void OnMarkerVisible(Vector3 worldPosition, bool isLocalPlayer, float headingDegrees, string playerId)
    {
        // Called once per visible tracked player, every blink-show cycle.
    }

    public override void OnPresent()
    {
        // Called once per blink tick, after this cycle's OnMarkerVisible calls (none, on a hide cycle).
        // Batch-present anything accumulated in OnMarkerVisible here.
    }
}
```

`UsesHeading` defaults to `true`; override it to `false` if your presentation doesn't care
about facing direction, so the overlay skips the extra `GetRotation()` call for every
tracked player, every remote tick. `OnMarkerVisible` fires per visible player; `OnPresent`
fires once per cycle regardless of how many (or how few) markers were visible that cycle —
it's the natural place to do a single batched flush rather than committing per-marker work
immediately in `OnMarkerVisible`. See [`RasterPlayerMarkerRenderer`](./raster-player-marker-renderer)
for a ready-made base that does exactly that.
