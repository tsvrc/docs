---
id: global-module
title: GlobalModule
sidebar_position: 4
---

# GlobalModule

`Tsvrc.Editor.GlobalModule` generates one named field per `_ts`-exposed scene object.
`TsConfig.GlobalEntries` and `TsBuiltinConfig.GlobalEntries` are merged into a single set,
scene entries resolved first so they keep an unsuffixed name on a collision with a builtin.
Naming is the point of a Global: it accepts any scene object, not only a `TsvrcBehaviour`,
which is what sets it apart from [Construct](./construct-module) (initialization only, no
name at all). See that page's "Construct vs. Global" section for the full comparison, and
[Reach a scene object from anywhere, or guarantee it
initializes](../../how-to/reaching-a-scene-object) for a task-oriented walkthrough of both.

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
[`TsConfig`](../config/ts-config).

## Generated shape

Each entry becomes a `[HideInInspector][SerializeField] public {Type} {Name};` field plus,
inside `_TsGlobalStart()`, a `{Name}.TsConstruct(this);` call, but only for entries whose
type is actually a `TsvrcBehaviour`. A plain `GameObject` or arbitrary `Component` reference
is exposed without ever being constructed, since construction only makes sense for
`TsvrcBehaviour`s.

## Tree-shaking and the snapshot fallback

Globals participate fully in `TreeShakeUnused` (via `TsUsageScanner.IsMemberReferenced`,
checking for `_ts.Name` in project source) and in `ApplySnapshotFallback`. See
[`TsModule`](../internals/ts-module) for the shared mechanics behind both. This
module is the primary example the snapshot fallback exists for: a broken compile nulls out
live scene references to any component declared in the broken assembly, which is exactly
what a real Global entry usually is.

## Collision handling

`ExcludeFieldNames` drops any Global entry whose name lost a cross-module collision, most
commonly two Global entries independently deriving the same name (two plain GameObjects
both named "Manager", say), or a Global entry that happens to auto-derive a reserved name
like `Instance` (see [`InstanceModule`](./instance-module)'s reserved-name precedence). It
logs a warning naming the fix: give one of the conflicting entries a distinct explicit
`Name`. A Construct entry never causes this, since a construct's field is always private and
never claims a name at all.
