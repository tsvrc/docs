---
id: raster-player-marker-renderer
title: RasterPlayerMarkerRenderer
sidebar_position: 6
---

# RasterPlayerMarkerRenderer

`Tsvrc.UI.RasterPlayerMarkerRenderer` is an optional
[`PlayerMarkerRenderer`](./player-marker-renderer) base that paints markers into a raster
texture displayed on a `RawImage` — a minimap-style overlay. It owns all the texture and
pixel-buffer plumbing, the world-to-pixel coordinate mapping, and a flush-only-when-dirty
optimization; you only override `DrawMarker` to decide what gets painted at each player's
projected pixel position, typically using [`TextureGraphics2D`](./texture-graphics-2d)'s
drawing primitives.

## Setup

```csharp
renderer.Setup(width: 256, height: 256, worldOrigin: someWorldPoint, unitsPerGridX: 4f, unitsPerGridZ: 4f);
```

`Setup` allocates the texture and pixel buffer and configures the world-to-pixel mapping —
`worldOrigin` is the world-space point that maps to pixel `(0, 0)` (the bottom-left corner
on the XZ plane), and `unitsPerGridX`/`Z` are pixels per world unit along each axis. It's
safe to call again to reconfigure (the old texture is destroyed first); invalid arguments
(non-positive dimensions or units-per-grid) are rejected with a logged error rather than
producing a broken texture. `OverlayFilterMode` (default `Point`) controls whether the
result looks crisp (good for pixel-art-style minimaps) or smooth when the `RawImage` is
scaled up.

## Overriding DrawMarker

```csharp
public override void DrawMarker(Color32[] pixelBuffer, int textureWidth, int textureHeight,
    int pixelX, int pixelY, bool isLocalPlayer, float headingDegrees, string playerId)
{
    TextureGraphics2D.DrawCircleToBuffer(pixelBuffer, textureWidth, textureHeight, pixelX, pixelY, 4, someColor);
}
```

`OnMarkerVisible` (inherited, already implemented) projects the given world position into a
pixel coordinate — clamped to stay within the texture bounds rather than wrapping or
throwing for a player outside the mapped world region — and calls `DrawMarker` with that
projected position. You draw directly into the shared pixel buffer using whichever
`TextureGraphics2D` buffer-based primitives fit your marker shape.

## Flush-only-when-dirty

`OnPresent` (also inherited) only actually re-uploads the texture to the GPU when something
changed. A cycle where `DrawMarker` was called at least once flushes the drawn buffer and
marks it dirty; the *next* cycle, if nothing was drawn (a hide cycle, or every tracked player
left), clears the buffer once, flushes that single clear, and then stops flushing entirely
until something is drawn again. This means an idle overlay with no visible markers costs
nothing per cycle beyond a single flag check — the GPU only ever sees a new frame of texture
data when the picture has actually changed.
