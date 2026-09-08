---
id: global-module
title: GlobalModule
sidebar_position: 8
---

# GlobalModule

`Tsvrc.Editor.GlobalModule` generates one named field per `_ts`-exposed scene object —
`TsConfig.GlobalEntries` and `TsBuiltinConfig.GlobalEntries` merged into a single set,
scene entries resolved first so they keep an unsuffixed name on a collision with a builtin.
This is the module behind the [tutorial](../first-behaviour)'s "register your behaviour as
a construct" flow's sibling concept — a Global doesn't get constructed at startup the way a
Construct does, it's purely a named reference.

## Usage

Register a scene object as a Global on the Configure window's Globals tab, then reach it
from any behaviour by the generated field name:

```csharp
_ts.ScoreboardAnimator.SetTrigger("Refresh");
```

## Naming

An entry's generated member name is its explicit `Name` if set, otherwise derived by
`DeriveName`: a plain `GameObject` reference is named after the GameObject itself (the
literal type name `"GameObject"` would be useless and collide across every ungrouped plain
GameObject entry), an `Animator` reference is named `{GameObjectName}Animator`, and anything
else uses its component type name directly. A group with `IncludeInName` set prefixes the
final name with its (and its opted-in ancestors') own name, exactly as described on
[`TsConfig`](../config/ts-config.md).

## Generated shape

Each entry becomes a `[HideInInspector][SerializeField] public {Type} {Name};` field plus,
inside `_TsGlobalStart()`, a `{Name}.TsConstruct(this);` call — but only for entries whose
type is actually a `TsvrcBehaviour`; a plain `GameObject` or arbitrary `Component` reference
is exposed without ever being constructed, since construction only makes sense for
`TsvrcBehaviour`s.

## Tree-shaking and the snapshot fallback

Globals participate fully in `TreeShakeUnused` (via `TsUsageScanner.IsMemberReferenced`,
checking for `_ts.Name` in project source) and in `ApplySnapshotFallback` — see
[`TsModule`](../codegen-internals/ts-module) for the shared mechanics behind both. This module is
the primary example the snapshot fallback exists for: a broken compile nulls out live scene
references to any component declared in the broken assembly, which is exactly what a real
Global entry usually is.

## Collision handling

`ExcludeFieldNames` drops any Global entry whose name lost a cross-module collision (most
commonly to a [Construct](./construct-module) registering the same object — a Construct's
accessor always wins over a same-named Global, per its higher `FieldNamePrecedence`) and
logs a warning naming the fix: either remove the redundant Global entry, or give one of the
two a distinct name.
