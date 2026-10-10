---
id: combining-meshes
title: Combine meshes and colliders before uploading
sidebar_position: 17
---

# Combine meshes and colliders before uploading

How to merge a group of static scene objects into one multi-material mesh, and their
colliders where possible, to cut down draw calls before you upload, using
**Tsvrc > Tools > Mesh Combiner**.

## Steps

1. Select the scene objects you want combined (a wall of individual rocks, a set of
   static props), then open **Tsvrc > Tools > Mesh Combiner**.
2. Click **Load from Selection**. This also picks up any GameObject with a collider but
   no `MeshFilter` (a collider-only source) and any GameObject with a `ParticleSystem`
   but no `MeshFilter`, without needing its own slot.
3. Choose a save path for the combined mesh asset, leave **Exclude EditorOnly** and
   **Combine Colliders** on unless you have a reason not to, and click **Combine**.

The tool creates one new GameObject with the combined `MeshFilter`/`MeshRenderer` (and a
`MeshCollider` if any solid colliders were merged), one child per recreated primitive or
trigger collider, and deactivates the sources (or, for a source carrying an
`UdonSharpBehaviour`, only disables its `MeshRenderer` so the script and its own collider
keep working).

## Deciding whether to recalculate normals

Leave **Recalculate Normals** off (the default) to preserve baked or hand-authored
normals from the source meshes. Turn it on only if the sources' own normals don't look
right once merged, since recalculating from the combined geometry can smooth over
intentional hard edges.

## If you change your mind

Undo reverses the new GameObject, the recreated collider children, and the source
deactivation as one step. It doesn't remove the saved mesh asset file (and the
`_Collider` asset alongside it, if one was created): Unity's own Undo system doesn't
track saving an asset to disk. Delete those files by hand if you undo a combine you
don't want to keep.

## Why this shape

See [the Mesh Combiner's reference page](../utilities/mesh-combiner) for exactly which
colliders merge versus get recreated as children, how a source carrying an
`UdonSharpBehaviour` is handled differently throughout, and the two conditions that
disable the Combine button outright rather than letting it produce a broken result.
