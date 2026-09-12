---
id: mesh-combiner
title: Mesh Combiner
sidebar_position: 5
---

# Mesh Combiner

**Tsvrc > Tools > Mesh Combiner** (`MeshCombinerWindow`, backed by the pure
`MeshCombinerTool.Combine`) merges multiple `MeshFilter` sources into a single
multi-material mesh asset, along with their colliders. It's independent of the rest of the
codegen system — no dependency on `TsConfig`, `TsGenerator`, or any other module.

## Usage

Select scene objects, click **Load from Selection** (or add `MeshFilter` slots manually),
choose a save path, and click **Combine**. Loading from selection also picks up two kinds of
object that don't need their own slot: GameObjects with colliders but no `MeshFilter`
(collider-only sources), and GameObjects with a `ParticleSystem` but no `MeshFilter` (kept
as separate children of the combined output rather than merged into the mesh, so their own
settings survive intact).

## What gets merged, and what doesn't

The visual mesh is built in two passes: sources are first merged per-material into flat
meshes, then those per-material meshes are combined again as separate submeshes — this is
what keeps material boundaries intact in the final multi-material result rather than losing
per-source materials. Colliders follow their own rules:

- A **solid `MeshCollider`** merges into one combined collision mesh.
- A **trigger `MeshCollider`**, or any **primitive collider** (Box/Sphere/Capsule), can't be
  merged that way — a trigger flag or a primitive shape would be lost in a merge — so these
  are returned separately for the caller to recreate as individual child GameObjects instead.
- A **disabled collider** is skipped entirely rather than recreated enabled, since silently
  re-enabling it would be a real behavior change, not a mesh optimization.
- A source carrying an `UdonSharpBehaviour` has its colliders **excluded from collection
  entirely**, so its physics callbacks (`OnTriggerEnter`, etc.) keep firing against the
  original object rather than a combined mesh that can't dispatch Udon events the same way.

## Two known trap conditions, checked before combining

Two situations disable the Combine button outright with an explanatory message, rather than
letting a combine "succeed" and produce a broken or invisible result:

- **Running in Play Mode** — a combine creates real scene objects and assets; anything
  created in Play Mode vanishes on exit, so combining there would look like it worked and
  then silently lose everything.
- **The chosen root Transform is itself one of the sources being combined, or a descendant
  of one.** The window's default behavior deactivates source objects after a successful
  combine (`_deactivateSources`), and `Transform.activeInHierarchy` cascades to children —
  if the combined result was just reparented under a Transform that then gets deactivated as
  a "source," the newly-created mesh vanishes from the Scene view with no error at all.
  Reordering the deactivate and reparent steps wouldn't fix this case (the root itself is
  the thing being deactivated), so it's caught and blocked before `Combine` ever runs
  instead.

Every combine groups its resulting Undo operations under one name, so a single Ctrl+Z
reverses the whole operation — new mesh asset, new GameObject, deactivated sources, and all
— rather than requiring several undo steps to fully back out.

## What a combine actually creates

A successful combine saves the visual mesh to the chosen path, and — only when merged
colliders exist — a second collision-mesh asset saved alongside it at the same path with
`_Collider` inserted before the extension. It then creates one new GameObject holding the
combined `MeshFilter`/`MeshRenderer` (and a `MeshCollider` referencing the collision mesh, if
any), reparented under the chosen root, plus one child GameObject per recreated primitive or
trigger collider, positioned and scaled to match the original.

Deactivating sources afterward (the default, toggled by **Deactivate Sources**) treats a
source with an `UdonSharpBehaviour` differently from an ordinary one: instead of deactivating
the whole GameObject, it only disables that source's `MeshRenderer`, leaving the GameObject
itself — and so the Udon script and its collider — active. A collider-only source only gets
deactivated when its collider was actually folded into the combined result (**Combine
Colliders** on); deactivating one whose collider was never combined would remove its physics
with nothing left to replace it.

`Combine` never checks a source's own active state — an inactive `MeshFilter` still
contributes geometry, unlike `Exclude EditorOnly`, which is an explicit opt-in filter rather
than an implicit one.
