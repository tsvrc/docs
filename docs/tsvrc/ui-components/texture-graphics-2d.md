---
id: texture-graphics-2d
title: TextureGraphics2D
sidebar_position: 3
---

# TextureGraphics2D

`Tsvrc.UI.Utils.TextureGraphics2D` is a static utility for pixel-level 2D drawing onto
Unity textures: filled rectangles, lines, circles, and headed triangles. It's a software
rasterizer — there's no GPU shader involved — built for UdonSharp contexts where drawing a
handful of shapes onto a small texture (an overlay HUD, a minimap marker) is simpler than
setting up a render pipeline for it.

## Two families of method, and when to use each

Every drawing operation comes in two forms:

- **Texture methods** (`DrawLine`, `DrawCircle`, `FillTexture`, ...) call `Texture2D.SetPixel`
  directly. They're simpler to call — you only need the texture — but slower, because each
  call has its own per-pixel bounds check and there's no way to batch the upload.
- **Buffer methods** (`DrawLineToBuffer`, `DrawCircleToBuffer`, ...) write into a
  pre-allocated `Color32[]` buffer you own, and pre-clamp their drawing bounds once up
  front rather than checking per pixel. Nothing reaches the GPU until you call
  `FlushBuffer`, so draw everything you need into the buffer first, then flush once.

Use the buffer form whenever you're drawing more than one or two shapes before the result
needs to be visible — that's the entire reason it exists. `FlushBuffer` itself notes why:
Unity's `Texture2D.Apply()` is expensive because it re-uploads every pixel regardless of how
many actually changed, so the cost is paid once no matter how many shapes you drew into the
buffer beforehand.

## Coordinate and bounds conventions

All texture-based methods take pixel coordinates with `(0, 0)` at the bottom-left, matching
`SetPixel`'s own convention, and clip silently at the texture's edges: a shape drawn
partially or entirely off the texture never throws, it just doesn't draw the out-of-bounds
part.

Buffer methods clip the same way against `bufferWidth`/`bufferHeight` — but only against
those two parameters, not against `buffer.Length` itself. Passing a buffer shorter than
`bufferWidth * bufferHeight` throws `IndexOutOfRangeException` once a clipped-in-bounds
pixel lands past the buffer's real length; a zero-length buffer with matching zero
dimensions is fine and simply draws nothing. In other words: coordinates are always safe to
pass, but the buffer size and the width/height you pass alongside it must actually agree.

None of the methods null-check their `texture` or `buffer` argument — a `null` throws
`NullReferenceException` immediately.

## Shape-specific behavior

- **`DrawLine` / `DrawLineToBuffer`** use Bresenham's algorithm with a square brush of the
  given `thickness` centered on each point. Thickness `0` still draws a single-pixel-wide
  line (the brush half-width is `thickness / 2` with integer division, so it degenerates to
  one row/column rather than disappearing). A zero-length line (equal start and end points)
  draws a single point.
- **`DrawHorizontalLine` / `DrawVerticalLine`** (and their buffer equivalents) draw a solid
  span. Zero thickness or zero length draws nothing — unlike `DrawLine`, there's no
  brush-degenerates-to-one-pixel behavior here.
- **`DrawCircle` / `DrawCircleToBuffer`** fill a disc using the `dx² + dy² ≤ r²` test.
  Radius `0` draws a single center pixel. Radius `1` draws a plus shape, not a 3×3 square —
  the four diagonal pixels are at distance `√2` from the center, which fails the `≤ 1` test.
  A negative radius draws nothing (the iteration range is empty rather than throwing).
- **`DrawTriangleToBuffer`** draws a filled, direction-aware triangle inscribed in a
  `(2×halfWidth) × (2×halfHeight)` box. `headingDegrees` follows Unity's Y-axis rotation
  convention: `0°` points the tip toward `+Y` (up), and increasing degrees rotate the tip
  clockwise (`90°` toward `+X`). Headings outside `[0, 360)`, including negative values, are
  accepted directly — trigonometric functions handle the wraparound, so `-90°` points the
  same direction as `270°`. Degenerate or negative half-extents don't throw.

## Usage

Drawing several shapes and uploading once, the pattern the buffer methods exist for:

```csharp
var buffer = new Color32[texture.width * texture.height];
TextureGraphics2D.ClearBuffer(buffer);

TextureGraphics2D.DrawCircleToBuffer(buffer, texture.width, texture.height,
    centerX, centerY, radius: 6, color: Color.red);
TextureGraphics2D.DrawLineToBuffer(buffer, texture.width, texture.height,
    x0, y0, x1, y1, thickness: 2, color: Color.white);

TextureGraphics2D.FlushBuffer(texture, buffer);
```

Calling the non-buffer `DrawCircle`/`DrawLine` methods instead works too, but each call
uploads to the GPU on its own — reach for those only when you're drawing a single shape and
don't need the buffer.

## Buffer-only helpers

`ClearBuffer` and `FillBuffer` write to every element of a buffer (transparent or a solid
color respectively) without touching the GPU; `FlushBuffer` is what actually uploads a
buffer via `SetPixels32` followed by `Texture2D.Apply(false)` — the `false` skips mipmap
recalculation, which only matters if the texture was created with a mip chain in the first
place.
