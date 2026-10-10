---
id: texture-graphics-2d
title: TextureGraphics2D
sidebar_position: 3
---

# TextureGraphics2D

`Tsvrc.UI.Utils.TextureGraphics2D` is a static utility for pixel-level 2D drawing onto
Unity textures: whole-texture fills, lines (including horizontal/vertical spans), circles,
and headed triangles. It's a software rasterizer, no GPU shader involved, built for
UdonSharp contexts where drawing a handful of shapes onto a small texture (an overlay HUD,
a minimap marker) is simpler than setting up a render pipeline for it.

## Two families of method, and when to use each

Every drawing operation comes in two forms, and neither one reaches the GPU by itself:

- **Texture methods** (`DrawLine`, `DrawCircle`, `FillTexture`, ...) write straight into the
  `Texture2D` you pass in, but only into its CPU-side pixel data. [Unity's own `SetPixel`
  docs say so
  directly](https://docs.unity3d.com/ScriptReference/Texture2D.SetPixel.html): "you must
  call `Apply` after `SetPixel`" for a change to actually reach the GPU. None of these
  methods call `Apply` for you, so nothing you draw with them is visible until you call
  `texture.Apply()` yourself once you're done. `DrawLine`, `DrawHorizontalLine`,
  `DrawVerticalLine`, and `DrawCircle` write pixel by pixel via `Texture2D.SetPixel`, each
  with its own bounds check. `FillTexture` and `ClearTexture` are the exception within this
  family: they build a full-size array and write it in one shot via `Texture2D.SetPixels32`
  rather than looping over `SetPixel`, but they still don't call `Apply` either.
- **Buffer methods** (`DrawLineToBuffer`, `DrawCircleToBuffer`, ...) write into a
  pre-allocated `Color32[]` buffer you own instead of a `Texture2D`, and pre-clamp their
  drawing bounds once up front rather than checking per pixel. Nothing reaches even the
  texture's CPU-side data, let alone the GPU, until you call `FlushBuffer`.

Use the buffer form whenever you're drawing more than one or two shapes before the result
needs to be visible: skipping repeated `SetPixel` calls in favor of plain array writes, and
paying for [the genuinely expensive
`Apply()`](https://docs.unity3d.com/ScriptReference/Texture2D.Apply.html) exactly once no
matter how many shapes you drew, is the entire reason the buffer family exists. Unity's own
docs for `Apply` say why: it "copies all the pixels in the texture even if you've only
changed some of the pixels," so the fewer times you call it, the better.

## Coordinate and bounds conventions

Every method that takes explicit coordinates uses pixel coordinates with `(0, 0)` at the
[bottom-left corner](https://docs.unity3d.com/ScriptReference/Texture2D.GetPixel.html)
("the lower left corner is (0, 0)," in Unity's own words), and clips silently at the
texture's or buffer's edges: a shape drawn partially or entirely out of bounds never throws,
it just doesn't draw the out-of-bounds part. `FillTexture` and `ClearTexture` take no
coordinates at all; they always cover the whole texture.

Buffer methods clip against `bufferWidth`/`bufferHeight`, the two parameters you pass
alongside the array, not against `buffer.Length` itself. Passing a buffer shorter than
`bufferWidth * bufferHeight` throws `IndexOutOfRangeException` once a clipped-in-bounds
pixel lands past the buffer's real length; a zero-length buffer with matching zero
dimensions is fine and simply draws nothing. In other words: coordinates are always safe to
pass, but the buffer size and the width/height you pass alongside it must actually agree.

None of the methods null-check their `texture` or `buffer` argument, but the two families
fail differently on `null`. A texture-based method always touches `texture` on its very
first pixel regardless of the coordinates given, so a `null` texture throws
`NullReferenceException` unconditionally. A buffer-based method pre-clamps its drawing
bounds before writing anything, so a `null` buffer paired with a shape whose bounds end up
empty (a negative radius, a zero-length span, a triangle entirely off the buffer) never
actually indexes into the buffer, and doesn't throw at all: it just draws nothing, same as
it would with a real buffer in that situation.

## Shape-specific behavior

- **`DrawLine` / `DrawLineToBuffer`** use Bresenham's algorithm with a square brush of the
  given `thickness` centered on each point. Thickness `0` still draws a single-pixel-wide
  line (the brush half-width is `thickness / 2` with integer division, so it degenerates to
  one row/column rather than disappearing). A zero-length line (equal start and end points)
  draws a single point.
- **`DrawHorizontalLine` / `DrawVerticalLine`** (and their buffer equivalents) draw a solid
  span. Zero thickness or zero length draws nothing, unlike `DrawLine`: there's no
  brush-degenerates-to-one-pixel behavior here.
- **`DrawCircle` / `DrawCircleToBuffer`** fill a disc using the `dx² + dy² ≤ r²` test.
  Radius `0` draws a single center pixel. Radius `1` draws a plus shape, not a 3×3 square:
  the four diagonal pixels are at distance `√2` from the center, which fails the `≤ 1` test.
  A negative radius draws nothing (the iteration range is empty rather than throwing).
- **`DrawTriangleToBuffer`** draws a filled, direction-aware triangle inscribed in a
  `(2×halfWidth) × (2×halfHeight)` box. `headingDegrees` follows Unity's Y-axis rotation
  convention: `0°` points the tip toward `+Y` (up), and increasing degrees rotate the tip
  clockwise (`90°` toward `+X`). Headings outside `[0, 360)`, including negative values, are
  accepted directly: trigonometric functions handle the wraparound, so `-90°` points the
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

Calling the non-buffer `DrawCircle`/`DrawLine` methods instead works too, but remember to
call `texture.Apply()` yourself afterward: nothing is visible until you do. Reach for those
only when you're drawing a single shape and don't need the buffer; drawing several shapes
this way still means writing them all before that one `Apply()` call, or you pay its full
cost per shape instead of once.

## Buffer-only helpers

`ClearBuffer` and `FillBuffer` write to every element of a buffer (transparent or a solid
color respectively) without touching the GPU. `FlushBuffer` is what actually uploads a
buffer via `SetPixels32` followed by `Texture2D.Apply(false)`. The `false` skips mipmap
recalculation, which only matters if the texture was created with a mip chain in the first
place.
