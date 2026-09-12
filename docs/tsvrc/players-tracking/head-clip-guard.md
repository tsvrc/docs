---
id: head-clip-guard
title: HeadClipGuard
sidebar_position: 6
---

# HeadClipGuard

`Tsvrc.Player.HeadClipGuard` stops a VR player's head from clipping through solid geometry
by teleporting them back out along the axis their body most likely entered from. Its
generated shadow is `TsHeadClipGuard`. It's a local-only, per-client behaviour (no network
sync) that runs every frame in
[`PostLateUpdate`](https://udonsharp.docs.vrchat.com/events/#udon-update-events), fired
"near the end of the frame after IK has been calculated," so tracking and IK have
already settled by the time it runs.

## Getting an instance

`HeadClipGuard` ships as one of TsVRC's own default factory entries (`TsBuiltinConfig`).

- **Default:** `_ts.CreateHeadClipGuard(parent)` just works, nothing to register in
  Configure first.
- **Manual:** skip the factory entirely. `AddComponent` it (or drag the shipped
  `HeadClipGuard` prefab into your scene) and call `Begin` directly, no `TsConstruct` call
  needed first. `Begin` itself re-caches the local `VRCPlayerApi` reference if it's still
  unset, the same reference `TsStart` would otherwise cache, so a never-constructed
  instance still guards correctly.

## Usage

```csharp
guard.Begin(solidColliders, count);
// ... later, when the guarded region no longer applies:
guard.End();
```

`Begin` bakes each `BoxCollider`'s world-space center, rotation, and half-extents once
(a one-time cost, not repeated per frame) and starts the guard. Null entries in the
array are skipped rather than rejected. `End` fully resets all runtime state and is safe to
call before a later `Begin` on the same instance, so one `HeadClipGuard` can be reused
across multiple guarded sessions rather than requiring a fresh instance each time.

## How it decides which way to push

Detection happens in world space against oriented bounding boxes (not axis-aligned: each
collider's own rotation is respected), each expanded by a configurable `_margin` so the head
stays a small distance from the wall surface instead of resting exactly on it. When the head
is inside a violated box, the push direction is chosen by which axis the player's *body*
(the VRChat capsule position, not the head) most exceeds the box's raw extents on. The
assumption is that whichever direction the body is pushing from is the direction the
head entered through, and the correct way to eject it. If the body is also fully inside the
same box (both head and body clipped, a rarer case), it falls back to pushing the head
toward its own single nearest face instead, since there's no body-direction signal to use.
Multiple simultaneous violations (a corner, where two OBBs overlap) accumulate their push
vectors. If two pushes happen to cancel out exactly (the head trapped symmetrically
between two opposing walls), the guard falls back to the last known safe capsule
position instead of teleporting to a net-zero displacement.

## Performance design

Every frame potentially scanning every collider in a scene as a full OBB test would be
wasteful, so the guard layers three progressively cheaper checks:

1. **Movement gate** — if the head hasn't moved more than a small threshold (default 5mm,
   comfortably above VR tracking jitter) on any axis since the last processed frame, and no
   violation was active, the entire frame's work is skipped.
2. **Rolling batch scan** — instead of testing every collider's AABB against the head every
   frame, only a rotating slice (`1/_batchFrames` of the full list) is re-evaluated each
   frame, added to or removed from a compact candidate list in O(1) via swap-with-last. A
   collider only needs re-checking on the cadence set by `_batchFrames`, expanded by
   `_batchScanExpansion` to cover how far the head could plausibly move between two scans
   of the same collider.
3. **Tight AABB pre-reject, then full OBB test** — only candidates surviving the batch scan
   get a cheap axis-aligned bounds check, and only those get the full oriented-box test.

## Configuration invariants

- `_batchScanExpansion` must cover the maximum realistic head speed times the batch period:
  the field's own tooltip states the relationship as
  `batchScanExpansion >= maxSpeed * batchFrames / minFPS`. Set too small, a fast-moving head
  could pass a collider's stale batch AABB and get a false negative between scans.
- `_batchFrames < 1` is silently clamped to `1` rather than causing a division error.
