---
id: guarding-against-head-clipping
title: Stop VR players clipping through walls
sidebar_position: 11
---

# Stop VR players clipping through walls

How to push a VR player's head back out when it clips through solid geometry, using
[`HeadClipGuard`](../players-tracking/head-clip-guard), and how to make it an optional
comfort setting rather than something every world forces on.

## Steps

1. Spawn one with the generated factory method. `HeadClipGuard` ships as [one of TsVRC's
   own default factory entries](../explanations/builtin-registrations), so there's
   nothing to register on the Configure window first:

   ```csharp
   public class ComfortSettings : TsBehaviour
   {
       [SerializeField] private BoxCollider[] _wallColliders;
       private HeadClipGuard _guard;

       public void EnableHeadClipGuard()
       {
           if (_guard == null)
           {
               _guard = _ts.CreateHeadClipGuard(transform);
           }
           _guard.Begin(_wallColliders, _wallColliders.Length);
       }

       public void DisableHeadClipGuard() => _guard?.End();
   }
   ```

2. Call `EnableHeadClipGuard`/`DisableHeadClipGuard` from wherever your world's own
   comfort settings toggle lives. `Begin`/`End` are cheap to call repeatedly: `End`
   fully resets the guard's state, so the same instance can be reused across multiple
   guarded sessions instead of spawning a fresh one each time.

## Only guard the geometry that needs it

Pass just the colliders around the specific area a player could clip through (a wall
ring, a doorway frame), not every collider in the world: `Begin` bakes each one's world
transform once and the guard re-evaluates all of them every frame it's active.

## Why this shape

See [`HeadClipGuard`'s reference page](../players-tracking/head-clip-guard) for how it
decides which direction to push, the three-tier movement gate/batch-scan/full-test
pipeline that keeps per-frame cost down with many colliders, and the two tunable
invariants (`_margin`, `_batchScanExpansion`) worth understanding before changing them.
