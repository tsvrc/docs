---
id: showing-player-positions
title: Show player positions on an overlay
sidebar_position: 4
---

# Show player positions on an overlay

How to render a live minimap-style overlay of tracked players, using
[`PlayerPositionOverlay`](../ui-components/overlay/player-position-overlay) (itself a
[`PlayerTracker`](../players-tracking/player-tracker), no separate tracker component needed) and
[`RasterPlayerMarkerRenderer`](../ui-components/overlay/raster-player-marker-renderer).

## Steps

1. Add a `PlayerPositionOverlay` to your scene and register it as a construct. It's a
   [`PlayerTracker`](../players-tracking/player-tracker) underneath, so it needs
   `TsConstruct` to run before anything on it works. The renderer doesn't: neither
   `PlayerMarkerRenderer` nor `RasterPlayerMarkerRenderer` overrides `TsStart` or touches
   `_ts`, so it's safe to just drop one into the scene and assign it, no registration
   needed.
2. Subclass `RasterPlayerMarkerRenderer` to decide what a marker looks like:

   ```csharp
   public class DotMarkerRenderer : RasterPlayerMarkerRenderer
   {
       public override void DrawMarker(Color32[] pixelBuffer, int textureWidth, int textureHeight,
           int pixelX, int pixelY, bool isLocalPlayer, float headingDegrees, string playerId)
       {
           Color32 color = isLocalPlayer ? Color.green : Color.red;
           TextureGraphics2D.DrawCircleToBuffer(pixelBuffer, textureWidth, textureHeight, pixelX, pixelY, 4, color);
       }
   }
   ```

3. Wire the renderer's output texture to a `RawImage` in your UI, then configure and start
   the overlay:

   ```csharp
   public class MinimapController : TsBehaviour
   {
       [SerializeField] private PlayerPositionOverlay _overlay;
       [SerializeField] private DotMarkerRenderer _renderer;
       [SerializeField] private Transform _mapOrigin;

       protected override void TsStart()
       {
           _renderer.Setup(width: 256, height: 256, worldOrigin: _mapOrigin.position, unitsPerGridX: 4f, unitsPerGridZ: 4f);
           _overlay.Renderer = _renderer;
           _overlay.StartOverlay(new string[0]);
       }
   }
   ```

4. Add or remove players while it runs with the overlay's own (inherited) tracking methods,
   `_overlay.AddTrackedPlayers(playerIds)`/`RemoveTrackedPlayers(playerIds)`. The renderer
   picks up the change on its next tick with no extra wiring.

If only a subset of players should ever appear (not everyone in the instance), start the
overlay with that explicit ID list instead of an empty one.

## Swapping the drawing style

`RasterPlayerMarkerRenderer` handles the texture, pixel buffer, and flush timing; only
`DrawMarker` decides the visuals, so a different look (a triangle that rotates with heading,
say) is a different `DrawMarker` body, not a different setup:

```csharp
public override void DrawMarker(Color32[] pixelBuffer, int textureWidth, int textureHeight,
    int pixelX, int pixelY, bool isLocalPlayer, float headingDegrees, string playerId)
{
    TextureGraphics2D.DrawTriangleToBuffer(pixelBuffer, textureWidth, textureHeight, pixelX, pixelY, 5, 5, headingDegrees, someColor);
}
```

## Skipping the raster renderer

If you're not drawing to a texture at all (driving 3D world-space marker objects instead,
for example), implement [`PlayerMarkerRenderer`](../ui-components/overlay/player-marker-renderer)
directly rather than its raster subclass. `PlayerPositionOverlay` only ever talks to the
base class's two methods.

## Why this shape

`PlayerPositionOverlay` is a pure backend that never draws anything itself. See its
[reference page](../ui-components/overlay/player-position-overlay) for why presentation is split
out into a pluggable renderer, and what the two independent tick loops (position resolution
vs. blink) cost on their own.
