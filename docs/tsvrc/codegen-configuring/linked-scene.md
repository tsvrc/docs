---
id: linked-scene
title: TsLinkedScene
sidebar_position: 14
---

# TsLinkedScene

`Tsvrc.Editor.TsLinkedScene` is the single scene the code generator is allowed to read
scene-sourced configuration from — `TsConfig`, `[WirePool]` field scans, the compiled
scaffold root. It exists to close a real correctness gap: without it, every codegen lookup
searched "whatever scene happens to be loaded," which meant switching to look at an
unrelated scene, or a play-mode test's own temporary scene, could silently regenerate a
project's real generated output with an almost-empty result — a scene with no `TsConfig`
compiles clean, and per `TsModule`'s own snapshot-fallback logic, a clean compile with fewer
entries than before is treated as a deliberate deletion, not an error.

## How it's set

Set from **Tsvrc > Configure**, persisted in a small per-project asset
(`TsLinkedSceneConfig`, holding just a scene GUID) under the project's generated-output
folder. Until a project links a scene, every lookup falls back to the legacy "search
whatever scene is loaded" behavior, so an unconfigured project keeps working exactly as it
always did — linking is opt-in, not a breaking requirement.

The stored value is a GUID, not a path: Unity keeps a GUID's `.meta` mapping correct
automatically across a rename or move, so resolving the current path from the GUID at read
time makes renaming or relocating the linked scene a non-issue rather than a silent,
permanent break. A GUID that no longer resolves to *any* path means the scene asset itself
was deleted outright — distinguished from "linked but not currently open" via
`IsConfiguredButMissing`, so the Configure window can show the right message for each case.

## What it changes about lookups

Once a scene is linked, every scene-scoped lookup (`Find<T>`, `FindType`, `FindAll<T>`,
`FindAllType`) is scoped strictly to that scene's root objects, rather than searching
whatever's currently loaded. `Find<T>`/`FindType` additionally refuse to guess: if more than
one match exists within the linked scene, they return `null` rather than picking whichever
one Unity's iteration order happens to return first — the same "don't guess" stance
`InstanceModule` takes for resolving a project's single scaffold instance.

`IsConfiguredButNotLoaded` is true whenever a scene has been linked but isn't currently
among the loaded scenes, for any reason (including having been deleted — a strict superset
of `IsConfiguredButMissing`). The generator's own run logic treats this as a hard "do
nothing": once a scene has been explicitly linked, no other loaded scene is ever treated as
a legitimate substitute for it.

## Test-only override

`SetOverride`/`ClearOverride` exist purely as a test seam, mirroring a pattern used
elsewhere in the codegen tooling (`TsPaths`): a test can point lookups at its own synthetic
scene for the scope of that test, so the codegen test suite keeps resolving its own test
fixtures regardless of what a real consuming project happens to have linked.
