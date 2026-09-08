---
id: core-attributes
title: Framework attributes
sidebar_position: 6
---

# Framework attributes

Reference for the three plain marker attributes TsVRC's codegen reads by reflection at
edit time. None of them do anything at runtime themselves — they exist so the generator can
find and validate things without hardcoding a list of types.

## WirePoolAttribute

Put `[WirePool]` on a field to declare that it should be filled from a pool rather than
assigned by hand:

```csharp
[WirePool]
public MyPooledBehaviour slot;

[WirePool("used for enemy spawns")]
public MyPooledBehaviour describedSlot;
```

The optional constructor argument is a free-text description shown in the Configure
window's Pools tab; it has no effect on behavior. `PoolModule` checks every `[WirePool]`
field's type against `TsConfig.PoolEntries` and validates the pairing at generation time,
not compile time, so a mismatched or unregistered pool type surfaces as a codegen warning,
not a C# compiler error — see the pool module's own reference page for exactly what gets
checked. If the pooled type is a `TsvrcBehaviour` subclass, TsVRC calls `TsConstruct` on
each pool slot at scene start; for any other type, the field is just wired to a reference
with no construction step.

A `[WirePool]` field is read-only in the inspector: `WirePoolAttributeDrawer` disables the
GUI control while drawing it, the same technique `ReadOnlyAttribute` below uses. This is a
display-only restriction — it stops accidental edits in the Inspector, not a runtime
enforcement — the generator is what actually owns the field's value.

## TsCodegenIgnoreAttribute

Put `[TsCodegenIgnore]` on a class to exclude it from the generator's automatic type scans,
even though it would otherwise match one. The generator uses reflection to find candidate
types (for example, `Instance` subclasses when looking for your project's scaffold), and
those scans can't distinguish "this happens to be an `Instance` subclass" from "this is the
one real scaffold type" — a test double that subclasses a framework type for its own
purposes is the common case that needs excluding. Tagging it means the type is never
mistaken for a genuine scaffold candidate and never gets an unwanted, failing wiring attempt.

It carries no members and does nothing at runtime — it exists purely as a marker codegen
checks for.

```csharp
// A test double the generator would otherwise mistake for a real scaffold.
[TsCodegenIgnore]
public class FakeInstanceForTests : Instance
{
}
```

## TsWorldExtensionPointAttribute

Put `[TsWorldExtensionPoint("GeneratedName")]` on a framework base class to mark it as one
world scripts are meant to subclass directly, and to name the generated shadow class that
`ScaffoldModule` writes for it. See [How TsVRC fits together](./how-it-fits-together) for
why the shadow class exists at all — in short, it retypes the inherited `_ts` reference to
your project's own concrete generated root, so your code gets it fully typed with no cast.

You don't write this attribute yourself day to day — it's already on the framework classes
in the table below. What you actually write is a subclass of the generated shadow it
produces:

```csharp
public class GameManager : TsBehaviour // generated shadow of TsvrcBehaviour
{
}
```

`Inherited` is `false` on this attribute deliberately: tagging a base class must not
implicitly tag its own subclasses within the framework. `TsvrcMemory` and `TsvrcLogger`
both extend `TsvrcBehaviour` (which carries this attribute) without inheriting the tag
themselves — each extension point opts in on its own class, individually.

As of this writing, these are the framework classes tagged with this attribute and the
shadow name each one generates:

| Framework class | Generated shadow |
|---|---|
| `TsvrcBehaviour` | `TsBehaviour` |
| `Instance` | `TsInstance` |
| `Process` | `TsProcess` |
| `TsvrcTimer` | `TsTimer` |
| `TsvrcLogger` | `TsLogger` |
| `TsvrcMemory` | `TsMemory` |
| `PlayerTracker` | `TsPlayerTracker` |
| `AutoPlayerTracker` | `TsAutoPlayerTracker` |
| `ReadyCheckProcess` | `TsReadyCheckProcess` |
| `DataTransferer` | `TsDataTransferer` |
| `HeadClipGuard` | `TsHeadClipGuard` |
| `StateManager` | `TsStateManager` |
| `TsvrcList` | `TsList` |
| `ListItem` | `TsListItem` |
| `PlayerPositionOverlay` | `TsPlayerPositionOverlay` |
| `RankedGameSession` | `TsRankedGameSession` |

A class not on this list — for example any link in the `DataTransferer` inheritance chain
below `DataTransferer` itself — is internal plumbing you're not meant to subclass directly;
tagging it would just generate an unused shadow class.

The internal class name and its generated shadow name deliberately differ in most cases:
`TsvrcBehaviour` keeps its distinguishing `Tsvrc` prefix internally because a bare
`Behaviour` would collide with `UnityEngine.Behaviour`, while the shadow gets the clean
name (`TsBehaviour`) that your own code actually extends.
