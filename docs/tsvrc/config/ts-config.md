---
id: ts-config
title: TsConfig and TsBuiltinConfig
sidebar_position: 1
---

# TsConfig and TsBuiltinConfig

`Tsvrc.Config.TsConfig`, `TsGroup`, `TsGroupedEntry`, and `Tsvrc.Editor.TsBuiltinConfig`
together form the data model the codegen modules (Global, Pool, Construct, Factory) read at
generate time. You don't normally hand-edit these fields directly — **Tsvrc > Configure**
is the intended way to change them — but they're what the window actually writes to, and
what a codegen module's own reference page will describe reading from.

## TsConfig: one scene component holds everything

`TsConfig` is a plain `MonoBehaviour` (never compiled to Udon — it's compile-time-only
configuration), auto-created and self-healed as a child of the generated scaffold object.
It holds four parallel entry/group/next-id triples, one per registration kind:

| Entries | Groups | What they register |
|---|---|---|
| `GlobalEntries` | `GlobalGroups` | Scene objects exposed as named fields on the generated root (`_ts.Name`) |
| `PoolEntries` | `PoolGroups` | `UdonSharpBehaviour` prefabs to pool (must be prefab assets, not scene objects) |
| `ConstructEntries` | `ConstructGroups` | `TsvrcBehaviour`s always active in the scene — constructed at startup **and** exposed as `_ts.Name`, no separate Global entry needed |
| `FactoryEntries` | `FactoryGroups` | Prefabs registered for non-networked runtime instantiation via a generated `Create{Name}(Transform parent)` method |

Globals and Constructs hold scene-object references specifically because only a scene
object can hold one — a `ScriptableObject` asset has no stable way to reference a scene
object (a scene object's `fileID` is only meaningful within its own scene file). Pool and
Factory entries are asset/prefab references instead, which a scene object can hold just as
well — the constraint only runs one direction, which is why everything ends up on this one
scene component rather than split between an asset and a scene behaviour.

It's deliberately *not* placed under an `Editor/` folder, despite being editor-only
configuration: a script under a folder literally named `Editor` is excluded from the
runtime assembly, and `AddComponent` silently fails for such a type — the component could
never actually attach to a scene object. What strips it from the actual VRChat build
instead is an `EditorOnly` tag on its `GameObject`, set by the scaffold module.

`TreeShakeUnused` (off by default) and `ForceIncludeNames` control whether Global/Factory
entries not referenced anywhere in your project's own code get excluded from generated
output — see the relevant codegen module's reference page for the exact mechanics and the
two-pass grace period involved.

## TsGroup and TsGroupedEntry

`TsGroup` is one node in an entry group tree — flat, with a `ParentId` reference rather than
a nested/recursive structure, so it maps directly onto a tree-view's row model and avoids
Unity's serialization depth limit for nested types. `Id` is assigned once and never reused,
even after deletion. Groups are purely organizational by default; setting `IncludeInName`
turns nesting into namespacing, prefixing an opted-in group's own name (and its
opted-in ancestors') onto the generated member name of everything inside it — `_ts.Spawner`
under a plain group stays `_ts.Spawner`, but under a group named "Enemies" with
`IncludeInName` set it becomes `_ts.EnemiesSpawner`. Factory groups always prefix
regardless of this toggle; Global and Construct groups respect it per-group.

```csharp
// A scene object registered as a Global entry named "Spawner", inside a group
// named "Enemies" with IncludeInName set, shows up on the generated root as:
_ts.EnemiesSpawner.SetActive(true);
```

`TsGroupedEntry` pairs one registration (`Value`, an arbitrary `UnityEngine.Object` — a
scene object, component, or prefab) with its owning group (`GroupId`, `0` if ungrouped) and
an optional explicit `Name`. A blank `Name` derives a default from the component's type
name, a plain GameObject's own name, or a prefab's name, sanitized into a valid C#
identifier.

## TsBuiltinConfig: the same shape, library-wide

`TsBuiltinConfig` is a `ScriptableObject` (not a scene component — it's a package asset)
holding the same Global/Pool/Factory entry-and-group shape as `TsConfig`, but for
registrations TsVRC itself ships and wants present regardless of what any individual
project configures. It's merged with each project's own `TsConfig` at generate time, so a
library-provided global or pooled prefab shows up in the generated output the same way a
project's own entry would, without every project needing to register it by hand.
