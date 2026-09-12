---
id: ts-generator
title: TsGenerator
sidebar_position: 3
---

# TsGenerator

`Tsvrc.Editor.TsGenerator` is the orchestrator that drives every [`TsModule`](./ts-module)
through a full generation pass. It's what actually runs when you click **Force
Regenerate**, when a watched asset changes, or automatically after every recompile.

## When it runs

- **Force Regenerate / Initialize Tsvrc** (`ManualGenerate`) — a deliberate click, always
  treated as a real developer opportunity for tree-shaking's grace-period accounting.
- **After every domain reload** (`TsDomainReloadHandler`, via `AfterDomainReload`) — the
  main automatic trigger; a real recompile is unambiguous developer opportunity too.
- **A watched asset changes** (`TsAssetWatcher`) — any asset path a module declared via
  `WatchedAssets()` being imported, deleted, or moved schedules a rerun. A scene hierarchy
  change a module cares about, or a property edit on a watched component type, schedules one
  too, through `TsGenerator`'s own hierarchy-changed and Undo-postprocess hooks rather than
  through `TsAssetWatcher` itself.
- **Before a VRChat world build** (`TsBuildCompile`) — see below.

Every *automatic* trigger is gated by `AutomaticTriggersSuppressed`, which is true during
any automated test run (detected once, from the process's own `-runTests` command-line
flag) or inside an explicit `SuppressAutomaticTriggers()` scope. This exists because an
automatic pass reacting to whatever scene happens to be open, a test's own temporary scene
in particular, could otherwise silently regenerate a real project's output down to almost
nothing (see [`TsLinkedScene`](../config/linked-scene) for the deeper reason this is
dangerous). Deliberate, explicit calls a test makes on purpose
(`Run()`/`AfterDomainReload()` directly) are never gated; only the reactive paths that would
otherwise fire unattended are.

## The bootstrap signal

A pass with `allowBootstrap: false` (every automatic trigger's default) won't create a
project's scaffold from nothing. It waits until `HasBootstrapSignal()` finds a real reason
this project uses TsVRC (an existing `TsConfig` in the linked scene, an existing compiled
scaffold instance, or *any* non-abstract `Instance` subclass anywhere in the project, unless
marked [`[TsCodegenIgnore]`](../../core-concepts/attributes.md)). Until that signal appears, the
generator just re-arms a hierarchy-changed watch and returns. This is what makes an
unrelated, freshly-opened project safe to have TsVRC installed in without it immediately
scaffolding files nobody asked for. A deliberate **Force Regenerate**/**Initialize Tsvrc**
click passes `allowBootstrap: true` and *is* the signal.

## One pass, in order

`RunCore` runs, per pass: rebuild the whole-project [`ScriptIndex`](./supporting-utilities)
fresh (never cached across passes, since a script may have just changed) → check the
bootstrap signal → `LoadConfig()` on every module → collect tree-shaking results → detect
and resolve field-name collisions across modules → collect every module's watched paths →
delete any file a module no longer produces (would otherwise leave a stale partial-class
member behind, a guaranteed compile break, not just clutter) → write every module's
`GenerateCode()` output.

If any file changed on this pass, the generator stops there: the compiled type on disk is
now stale relative to what was just written, so wiring against it would target the wrong
field set. It schedules the pending-bootstrap/pending-regenerate flags, refreshes the asset
database (triggering a recompile), and lets the *next* pass, driven by that recompile's own
domain-reload trigger, pick up from `AfterFilesStable()` with the now-current compiled type.
Only once nothing needs writing does `Wire()` actually run, scoped to the linked scene's own
compiled scaffold instance so an unrelated instance in some other, additively-loaded scene
never gates it.

A module whose `AfterFilesStable()` isn't itself idempotent can trigger a bounded self-retry
(`RunCore` recursing on itself, capped at three passes) purely as a safety net against
runaway recursion. Real, well-behaved modules converge in one extra pass, since
`AfterFilesStable()` becomes a no-op once whatever it created already exists.

## Before a build

`TsBuildCompile` (a VRChat SDK build callback, ordered to run before UdonSharp's own build
pass) forces a generation pass before every scene build, so generated files and scene wiring
can't go stale relative to what's about to ship. It checks `TsLinkedScene.IsConfiguredButNotLoaded`
*before* `HasBootstrapSignal()` specifically because the bootstrap signal's own
any-Instance-subclass-anywhere fallback can't distinguish "the correct scene is open" from
"some unrelated scene is open"; only the linked-scene check can catch that. If nothing has
ever been set up at all, it offers to cancel the build rather than silently shipping a world
where every `TsvrcBehaviour`'s `_ts` reference would be `null` at runtime.

## Why this exists, briefly

`TsGenerator` is the concrete mechanism behind the codegen-vs-runtime-reflection split
described in [How TsVRC fits together](../../core-concepts/how-it-fits-together): every module's config is
read once, at edit time, and baked into real generated C#. Nothing about this pipeline runs
in the built world. See that page for the reasoning; this page only covers how the pipeline
itself is sequenced and triggered.
