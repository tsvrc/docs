---
id: reaching-a-scene-object
title: Reach a scene object from anywhere, or guarantee it initializes
sidebar_position: 13
---

# Reach a scene object from anywhere, or guarantee it initializes

How to register a scene object on the Configure window so codegen wires it up for you,
using either a **Global** (to name it and reach it from any script) or a **Construct**
(to guarantee it initializes, with no name at all).

## Choosing between them

Register something as a **Construct** when you only need it initialized (its `TsStart`
to actually run) and nothing else needs to reference it by name. Register it as a
**Global** when another behaviour needs to reach it as `_ts.Name` from anywhere in the
project. Register it as both if you need both: a Global entry that happens to be a
`TsvrcBehaviour` gets constructed too, so there's no conflict.

## Steps: registering a Global

1. Open **Tsvrc > Configure**, select the **Globals** tab, and drag the scene object in.
   Give it an explicit name, or leave it blank to derive one from the object/component
   name.
2. Click **Apply** in the window's pending-changes footer. That's what turns this
   registration into generated code: dragging the object in only stages the edit,
   **Force Regenerate** stays disabled while it's unapplied, and the automatic trigger
   that normally regenerates for you is suppressed for the same reason. See
   [`TsWindow`](../codegen/config/ts-window#apply--discard) for why edits made in this
   window are batched behind Apply/Discard instead of regenerating on every keystroke.
3. Reach it from any script by the generated field name:

   ```csharp
   public class ScoreboardController : TsBehaviour
   {
       protected override void TsStart()
       {
           _ts.ScoreboardAnimator.SetTrigger("Refresh");
       }
   }
   ```

Any scene object works as a Global, not just a `TsvrcBehaviour`, since a Global's whole
point is naming, not initialization. A plain `GameObject` or an arbitrary `Component`
reference is exposed the same way, just never constructed.

## Steps: registering a Construct

1. Open **Tsvrc > Configure**, select the **Constructs** tab, and drag the behaviour in.
   There's nothing to name.
2. Click **Apply** in the window's pending-changes footer, same as for a Global above.
   `TsStart` on that behaviour now runs at world start, whether or not anything else in
   the project ever references it:

   ```csharp
   public class HelloWorld : TsBehaviour
   {
       protected override void TsStart()
       {
           LogInfo("HelloWorld constructed.");
       }
   }
   ```

3. If something else later needs a direct reference to it, wire it the ordinary Unity
   way (a serialized field assigned in the Inspector), or register it as a Global too if
   you need it reachable by name.

A Construct must be a component and must be a `TsvrcBehaviour`; unlike a Global, an
arbitrary `GameObject` reference doesn't qualify.

## Why this shape

See [`GlobalModule`](../codegen/modules/global-module) and
[`ConstructModule`](../codegen/modules/construct-module)'s reference pages for how each
derives a default name, what happens on a name collision, and how tree-shaking can
exclude an unused Global if your project has `TreeShakeUnused` turned on.
