---
id: supporting-utilities
title: Generator support utilities
sidebar_position: 4
---

# Generator support utilities

A handful of small internal classes back [`TsGenerator`](./ts-generator) and the codegen
modules. None of these are things you call directly as an end user of TsVRC; they're
documented here for anyone extending the generator itself.

## ScriptIndex

Answers "does class X derive from class Y" and "does any script in the project contain this
text" by scanning every `MonoScript`'s raw source text, rather than by reflecting over
compiled types. This matters specifically because it has to keep working **while the
project doesn't currently compile**. Reflection over `Assembly-CSharp` is useless exactly
when a not-yet-generated member breaks the build, which is one of the more common moments a
codegen pass needs to run. It's deliberately a simple regex scan rather than a real parser
(good enough to find a class declaration's immediate base class by simple name), and
namespace-aware so two unrelated classes sharing a short name in different namespaces don't
get confused for each other: an ambiguous match reports "cannot prove derivation" rather
than guessing. Rebuilt fresh at the start of every generation pass, never cached across
passes.

## TsUsageScanner

Layered on top of `ScriptIndex`'s source scan to answer tree-shaking's real question: "is
this generated member actually used anywhere?" A Global/Log/Memory read has no attribute to
reflect over the way `[WirePool]` does. It's just `_ts.Name`, a bare member access in
arbitrary source text (`IsMemberReferenced`), so this has to pattern-match source rather
than inspect live objects. A Factory's generated `CreateName(parent)` call site is matched
the same way, via a separate method-call pattern (`IsMethodCallReferenced`). The matching is
deliberately conservative: a false positive (treating something as used when it isn't) only
wastes a few bytes of generated code, but a false negative would silently drop real content,
which is far worse. When genuinely in doubt, it reports "used."

## ModuleEntrySnapshot

Persists each module's last successfully resolved entries (name, type, and namespace,
never a live object reference) to a per-module JSON cache. `PoolModule` also stores its last
known-good `TotalSlots` per pool type alongside the entry, since that count comes from the
same kind of live, scene-wide reflection scan as the entry list itself; every other module
leaves it unused. This cache is what
[`TsModule.ApplySnapshotFallback`](./ts-module) reads from when a broken compile makes live
resolution untrustworthy. The scenario this protects against is real and has actually
happened: a world script referencing a not-yet-generated member breaks the whole compile,
which nulls out *every* scene reference to a component declared in that same assembly,
including every genuine Global or Factory entry, making a live resolution pass see zero
entries and, without this fallback, silently regenerate an empty result that wipes out real
configuration on the next domain reload.

## PackagePaths / TsPaths

`PackagePaths.Root` resolves the installed package's own root folder
(`Assets/Tsvrc` or `Packages/com.tsvrc.core`, depending on how it was added) using
`[CallerFilePath]`, so nothing else in the generator has to hardcode that path. `TsPaths` is
the single source of truth for everything else path- and identity-related: the generated
output folder, the compiled scaffold class's name and namespace. These are mutable fields
rather than constants specifically so tests can redirect them to scratch locations for the
duration of a test. Production code never changes them itself.

## TsAssetWatcher / TsDomainReloadHandler

`TsAssetWatcher` is a Unity `AssetPostprocessor` that schedules a rerun whenever an asset a
module declared via `WatchedAssets()` is imported, deleted, or moved (excluding the case
where that happened as part of a domain reload; `TsDomainReloadHandler` already owns that
path, so the two don't double-trigger). `TsDomainReloadHandler` is what actually calls
`TsGenerator.AfterDomainReload()` after every recompile; it also checks, eagerly and before
anything else, whether a scene is linked but the scaffold file is missing entirely. A
project that lost its generated folder outright (a bad `.gitignore`, an accidental delete)
otherwise just sees a wall of unrelated compile errors with no hint that **Force
Regenerate** is the fix.
