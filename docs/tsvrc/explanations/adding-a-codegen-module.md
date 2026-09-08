---
id: adding-a-codegen-module
title: Adding a new codegen module
sidebar_position: 4
---

# Adding a new codegen module

A how-to guide for contributors extending TsVRC's own generator, not for end users
configuring a world. It assumes you've read [`TsModule`](../codegen-internals/ts-module) and
[`TsGenerator`](../codegen-internals/ts-generator), and at least a couple of the existing modules
under [Codegen modules](../codegen-configuring/log-module) — the pattern below is drawn directly
from how those already work, not a hypothetical design.

## Decide what your module contributes

Every module answers three questions independently, and most modules only need to answer
some of them:

- **Does it generate a file?** Set `FileName` to a non-null string and implement
  `GenerateCode()`. A module that only wires data into another module's already-generated
  class (rare) leaves `FileName` at its default `null`.
- **Does it need its own Configure tab?** Set `TabLabel`/`TabDescription` and implement
  `DrawTab(SerializedObject)`. If your data lives on `TsConfig` as a group tree (like
  Globals, Pool, Constructs, Factories), you almost certainly want
  [`TsGroupTreeGUI.Draw`](../codegen-configuring/group-tree-and-inspectors) rather than writing
  your own tree UI from scratch.
- **Does it need to wire scene references after compile?** Implement `Wire()`. This is
  where you resolve the compiled type via `FindRoot()`, find or create whatever scene object
  your module owns, and assign serialized fields on it.

## Read config, generate code, wire the scene — in that order, every pass

`LoadConfig()` is where you read your config source (a `TsConfig` field, an asset, a scene
scan) and resolve it into whatever in-memory shape `GenerateCode()`/`Wire()` will read from.
Do this work once, in `LoadConfig()`, not lazily inside `GenerateCode()` or `Wire()` —
`TsGenerator` calls every module's `LoadConfig()` before any module's `GenerateCode()`,
specifically so cross-module concerns (field-name collision detection, most importantly)
can look at every module's resolved state before any file gets written.

`GenerateCode()` should be a pure function of what `LoadConfig()` already resolved — no
further config reads, no scene queries. If you have nothing to generate (an empty entry
list), return `BuildStub(usings, emptyMethodSignatures)` rather than `null`, so the
generated file still declares whatever empty methods other code expects to be able to call
unconditionally.

`Wire()` runs last, and only once nothing needed writing this pass (see
[`TsGenerator`](../codegen-internals/ts-generator) for why). Resolve the compiled root via
`FindRoot()`, look up your field with `TryFindField`, and assign it — then call
`ApplyAndMarkDirty(so, root)` once you're done, not after every individual assignment.

## Handle a broken compile without wiping real content

If your module resolves entries from live scene state (rather than, say, a static list),
protect it with [`ApplySnapshotFallback`](../codegen-internals/ts-module) exactly the way Global,
Factory, Construct, and Pool do. The scenario this protects against is real: a broken
compile anywhere in the project can null out every scene reference to a component declared
in the broken assembly, making your live resolution pass look like the user deleted
everything. Without the fallback, your next `GenerateCode()` call would silently regenerate
an empty stub and wipe out real, working configuration on the very next domain reload.

## Support tree-shaking if it's a reasonable fit

If your entries have a real, checkable "is this actually used" signal in project source
(a member access, a method call), wire it into [`ApplyTreeShaking`](../codegen-internals/ts-module)
the way Global and Factory do — don't hand-roll your own grace-period bookkeeping. If your
subsystem is a single on/off concern rather than a list of named entries (like Log or
Memory), extend [`TsSingleComponentModule`](../codegen-configuring/ts-single-component-module)
instead of `TsModule` directly and get the whole thing for free.

## Report exposed names, and pick a real precedence

If your module generates a member accessible via `_ts.Name`, report it through
`ExposedFieldNames()` so cross-module collisions get caught before they become duplicate-
member compile errors, and implement `ExcludeFieldNames(names)` to drop the losing side of a
collision cleanly (with a warning explaining the fix, not just silently disappearing). Only
reach for `ReservedFieldNamePrecedence` if your module declares a name unconditionally,
regardless of any user config (`InstanceModule`'s `Instance`, `TsSingleComponentModule`'s
`Log`/`Memory`) — an ordinary config-driven module should use the default precedence (`0`)
and let a real naming conflict resolve the normal way.

## Watch the right things

Populate `WatchedAssets()` with any asset path that should trigger a rerun when it changes
(most modules at least watch `BuiltinConfigPath`), and `WatchedComponentTypeNames()` with
any component type name whose *field-level* modifications (not just add/remove) should
trigger a rerun — `PoolModule` is the clearest example, since a `[WirePool]` field being
added to some unrelated behaviour changes the pool's own slot-count math without any pool
config itself changing.

## Write it up

Once your module works, give it its own page under [Codegen modules](../codegen-configuring/log-module),
following the shape those pages already use: what it generates and why, what's specific to
it versus inherited from `TsModule`/`TsSingleComponentModule`, and any real edge case a
careful reviewer would ask about — not just the happy path.
