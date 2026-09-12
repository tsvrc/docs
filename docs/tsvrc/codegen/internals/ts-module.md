---
id: ts-module
title: TsModule
sidebar_position: 2
---

# TsModule

`Tsvrc.Editor.TsModule` is the abstract base contract every codegen module implements.
[`LogModule`](../modules/log-module), [`MemoryModule`](../modules/memory-module),
[`PoolModule`](../modules/pool-module), and the other six modules documented under
Codegen > Modules all extend it. This page is for understanding how the generator pipeline
works and, eventually, for writing a new module yourself; if you're only *using* TsVRC
rather than extending its generator, you can skip it.
See [Adding a codegen module](./adding-a-codegen-module) for a worked example
of implementing one.

## The call sequence

`TsGenerator` calls every active module through a fixed sequence each run: `LoadConfig`,
then optionally `ExposedFieldNames`/`ExcludeFieldNames` (conflict detection), then
`GenerateCode`, then `AfterFilesStable`, then `Wire`. Modules must not depend on each
other's in-memory state. The only state safe to share across modules is scene state, read
through `FindRoot`/`TsLinkedScene`, never a module instance's own fields.

- **`LoadConfig()`** *(abstract)* — reads whatever config source this module cares about.
- **`GenerateCode()`** *(virtual, default `null`)* — returns the C# source fragment this
  module contributes to the generated partial class. `FileName` (also virtual, default
  `null`) names the file it writes; `null` means the module contributes no file of its own
  (for example, a module that only wires data into another module's already-generated
  class).
- **`AfterFilesStable()`** *(virtual, default `false`)* — runs once generated files have
  settled and compiled.
- **`Wire()`** *(virtual, no-op by default)* — resolves serialized fields on scene objects
  against the now-compiled generated type.
- **`WatchedAssets()`** / **`WatchedComponentTypeNames()`** — which asset paths or component
  type names, when modified, should trigger a regenerate pass.

## Field name collision handling

`ExposedFieldNames()` reports which member names a module's `GenerateCode()` output will
declare; `TsGenerator` cross-checks every module's list after `LoadConfig()` to catch two
modules that would otherwise generate the same member name. `ExcludeFieldNames(names)` is
then called with the actual conflicting set so the module can drop them (and log an error)
before generating real code. `FieldNamePrecedence` (default `0`) is the tie-breaker when two
modules want the same name: the higher-precedence module keeps it, others drop it, and an
exact tie strips the name from every claimant, since a tie at the same precedence is a
genuine, unresolvable collision. `ReservedFieldNamePrecedence` (`int.MaxValue`) marks a name
that's unconditionally present in generated code regardless of any user config, for example
`InstanceModule`'s own `Instance` property, so a config entry that happens to auto-derive
the same name is caught as an exclusion instead of silently producing a duplicate-member
compile error.

## Tree-shaking

`ApplyTreeShaking` is the shared filter behind `TsConfig.TreeShakeUnused`, used by every
module that supports it (Global, Factory, and Log/Memory via a single-element list) instead
of each reimplementing the same logic. An entry survives if it's referenced anywhere in the
project's own source, or explicitly named in `ForceIncludeNames`. An entry that's neither
isn't excluded immediately: it has to be observed unreferenced across **two separate
counting passes** first (a one-pass grace period), since nothing can reference a
`_ts.Something` member in code before that member has been generated at least once. A
brand-new entry would otherwise look indistinguishable from genuinely dead code. A pass
"counts" only when it represents a real developer opportunity to have added a reference (an
actual recompile or an explicit Force Regenerate/Initialize click); a pass triggered only
by a reactive watcher doesn't advance or reset that grace tracking.

## Snapshot fallback for a broken compile

`ApplySnapshotFallback` protects generated output across a transient broken compile: if the
project currently has compile errors and live resolution finds fewer entries than the last
known-good snapshot, the module uses the cached snapshot instead of overwriting real
generated content with a reduced or empty result. A restored, snapshot-sourced entry has no
way to recover an actual scene/prefab object reference from a name alone, so its `Wire()`
step just leaves that field `null` until the next clean compile refreshes the snapshot with
real objects. This protects the generated *code*, not the scene wiring, across the outage.
A separate, always-rising "last known good" count (tracked independently of the
compile-broken snapshot) also warns, without blocking the pass, when a *clean* compile
resolves fewer entries than before, since that's usually a sign of an accidental deletion (a
`TsConfig` object removed from the Hierarchy) rather than a deliberate one. A drop fully
accounted for by this same pass's own tree-shaking exclusions never triggers this warning;
only the remainder of a drop that tree-shaking doesn't explain counts as suspicious.

## Shared helpers for module authors

A handful of `protected`/`internal` static helpers exist purely to avoid every module
reimplementing the same logic: `Sanitize`/`SanitizeIdentifier` (arbitrary text → valid C#
identifier, PascalCased per word), `Deduplicate` (append a numeric suffix starting at `2` on
a name collision, matching the convention of OS file-copy dialogs), `BuildGroupPrefix`
(walks a `TsGroup` chain to build a namespacing prefix), `BreakGroupCycles` (defensively
resets a corrupted group hierarchy to root-level rather than looping forever), `ResolveEntries`
(the shared Global/Construct resolution loop: validates each `TsGroupedEntry`, resolves its
type even under a broken compile via `TryResolveObjectType`, and deduplicates the final
name), and `TryFindField`/`ApplyAndMarkDirty` for the `Wire()` step.

## Tab UI integration

A module with `TabLabel` non-`null` gets its own tab in **Tsvrc > Configure**, described by
`TabDescription` and drawn by `DrawTab(SerializedObject)`. `DrawTab` returns whether it
committed a change through its own nested `SerializedObject` (for example, drag-and-drop
group reparenting) rather than the caller's. The caller has to fold that into its own
"did anything change" tracking, since a raw `SerializedProperty` assignment never sets
`GUI.changed` on its own.
