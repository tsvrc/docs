---
id: ts-single-component-module
title: TsSingleComponentModule
sidebar_position: 5
---

# TsSingleComponentModule

`Tsvrc.Editor.TsSingleComponentModule` is the shared abstract base behind
[`LogModule`](./log-module) and [`MemoryModule`](./memory-module) — both generate exactly
one `[ReadOnly][SerializeField]` field, backed by exactly one library-internal singleton
component that the module itself creates and heals in the scene. Rather than duplicating
identical `GenerateCode`/`AfterFilesStable`/`Wire`/`OnSceneHierarchyChanged` logic twice,
this class implements all of it once, parameterized by seven abstract members a subclass
supplies: `ComponentType`, `FieldName`, `PublicPropertyName`, `StartMethodName`,
`ChildGameObjectName`, `ScriptPath`, `AssetPath`, and `ModuleTag`.

## Usage-gated, not existence-gated

`TsRoot.Log`/`TsRoot.Memory` are declared `virtual ... => null`, not `abstract` — so a
project that never uses logging or memory compiles perfectly fine without either field ever
being generated at all. Usage (tracked via the shared `ApplyTreeShaking` mechanism, treating
this single subsystem as a one-element list) gates exactly two things: whether
`GenerateCode()` emits the real field/property/start-method or a stub, and whether the
backing scene child object exists at all. A caller reading `_ts.Log` or `_ts.Memory` while
genuinely unused simply gets `TsRoot`'s own `null` default — there's no special-casing
needed elsewhere in the framework for "this subsystem happens to be turned off."

`IsUsed` is exposed as a `protected` property specifically so `LogModule`'s own Settings-tab
integration can tell "never generated yet, click Force Regenerate" apart from "deliberately
tree-shaken away, won't reappear until referenced or force-included" — without it, the tab's
guidance would be actively misleading once tree-shaking legitimately turns this subsystem
off.

## Self-healing, but never destructive to the shared package asset

`AfterFilesStable()` always calls `ScaffoldModule.EnsureUdonSharpProgramAsset` for
`ComponentType`'s own script/asset pair, regardless of current usage — those are permanent
package resources (`TsvrcLogger.cs`/`.asset`, `TsvrcMemory.cs`/`.asset`), never created or
deleted by this module, only healed if something about their linkage drifted. What usage
*does* control is the scene-local child object: when unused, an existing child under the
scaffold root is torn down (mirroring how `FactoryModule` empties its own container);
when used, `ScaffoldModule.EnsureChildSceneObject` creates or repairs it.

`Wire()` skips entirely while unused — there's no field on the compiled type to wire in that
state (`GenerateCode()` omitted it), and attempting to find it would trigger the shared
"force compile to regenerate" warning every single pass for a field that's deliberately,
permanently absent rather than merely stale.
