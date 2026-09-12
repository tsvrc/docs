---
id: core-attributes
title: Framework attributes
sidebar_position: 6
---

# Framework attributes

Reference for the three plain marker attributes TsVRC's codegen reads by reflection at
edit time. None of them do anything at runtime themselves. They exist so the generator
can find and validate things without hardcoding a list of types.

These attributes tag things across the whole framework, not just Core concepts, so a
few names below (a codegen module, a table of runtime classes) won't be familiar yet if
you're reading this section in order. That's expected: treat this page as one you come
back to once you've reached those pages, not one that assumes you already have.

## WirePoolAttribute

Put `[WirePool]` on a field to declare that it should be filled from a pool rather than
assigned by hand:

```csharp
[WirePool]
public MyPooledBehaviour slot;

[WirePool("used for enemy spawns")]
public MyPooledBehaviour describedSlot;
```

The optional constructor argument is a free-text description of what the pool is for.
Nothing currently reads it back: not the Configure window, not codegen. Today it's
documentation for whoever reads the field declaration, not something surfaced anywhere
in the UI. [`PoolModule`](../codegen-configuring/pool-module) (one of the codegen
modules covered later, under Configuring codegen) checks every `[WirePool]` field's
type against its own configuration and
validates the pairing at generation time, not compile time, so a mismatched or
unregistered pool type surfaces as a codegen warning, not a C# compiler error. See that
module's own reference page for exactly what gets checked. If the pooled type is a
`TsvrcBehaviour` subclass, TsVRC calls `TsConstruct` on each pool slot at scene start;
for any other type, the field is just wired to a reference with no construction step.

A `[WirePool]` field is read-only in the inspector: `WirePoolAttributeDrawer` disables
the GUI control while drawing it, the same technique
[`ReadOnlyAttribute`](../utilities/read-only-attribute) uses elsewhere. This is a
display-only restriction. It stops accidental edits in the Inspector, not a runtime
enforcement: the generator is what actually owns the field's value.

## TsCodegenIgnoreAttribute

Put `[TsCodegenIgnore]` on a class to exclude it from the generator's automatic type
scans, even though it would otherwise match one. The generator uses reflection to find
candidate types (for example, `Instance` subclasses when looking for your project's
scaffold), and those scans can't distinguish "this happens to be an `Instance` subclass"
from "this is the one real scaffold type." A test double that subclasses a framework
type for its own purposes is the common case that needs excluding. Tagging it means the
type is never mistaken for a genuine scaffold candidate and never gets an unwanted,
failing wiring attempt.

It carries no members and does nothing at runtime. It exists purely as a marker codegen
checks for.

```csharp
// A test double the generator would otherwise mistake for a real scaffold.
[TsCodegenIgnore]
public class FakeInstanceForTests : Instance
{
}
```

## TsWorldExtensionPointAttribute

Put `[TsWorldExtensionPoint("GeneratedName")]` on a framework base class to mark it as
one world scripts are meant to subclass directly, and to name the generated shadow class
that [`ScaffoldModule`](../codegen-configuring/scaffold-module) (the codegen module you
already met in [How TsVRC fits together](./how-it-fits-together)) writes for it. See
that page again for why the shadow class exists at all. In short, it
retypes the inherited `_ts` reference to your project's own concrete generated root, so
your code gets it fully typed with no cast.

You don't write this attribute yourself day to day: it's already on the framework
classes in the table below. What you actually write is a subclass of the generated
shadow it produces:

```csharp
public class GameManager : TsBehaviour // generated shadow of TsvrcBehaviour
{
}
```

`Inherited` is `false` on this attribute deliberately: tagging a base class must not
implicitly tag its own subclasses within the framework.
[`TsvrcMemory`](../networking-data/tsvrc-memory) and
[`TsvrcLogger`](../utilities/tsvrc-logger) both extend `TsvrcBehaviour` (which carries
this attribute) without inheriting the tag themselves. Each extension point opts in on
its own class, individually.

As of this writing, these are the framework classes tagged with this attribute and the
shadow name each one generates. Each links to its own reference page; follow one if the
name isn't familiar yet:

| Framework class | Generated shadow |
|---|---|
| [`TsvrcBehaviour`](./tsvrc-behaviour) | `TsBehaviour` |
| [`Instance`](./instance) | `TsInstance` |
| [`Process`](./process) | `TsProcess` |
| [`TsvrcTimer`](../networking-data/tsvrc-timer) | `TsTimer` |
| [`TsvrcLogger`](../utilities/tsvrc-logger) | `TsLogger` |
| [`TsvrcMemory`](../networking-data/tsvrc-memory) | `TsMemory` |
| [`PlayerTracker`](../players-tracking/player-tracker) | `TsPlayerTracker` |
| [`AutoPlayerTracker`](../players-tracking/auto-player-tracker) | `TsAutoPlayerTracker` |
| [`ReadyCheckProcess`](../players-tracking/ready-check-process) | `TsReadyCheckProcess` |
| [`DataTransferer`](../networking-data/data-transfer/data-transferer) | `TsDataTransferer` |
| [`HeadClipGuard`](../players-tracking/head-clip-guard) | `TsHeadClipGuard` |
| [`StateManager`](../game-flow/state-manager) | `TsStateManager` |
| [`TsvrcList`](../ui-components/list/tsvrc-list) | `TsList` |
| [`ListItem`](../ui-components/list/list-item) | `TsListItem` |
| [`PlayerPositionOverlay`](../ui-components/player-position-overlay) | `TsPlayerPositionOverlay` |
| [`RankedGameSession`](../game-flow/ranked-game-session) | `TsRankedGameSession` |

A class not on this list is internal plumbing you're not meant to subclass directly.
Tagging it would just generate an unused shadow class.

The internal class name and its generated shadow name deliberately differ in most
cases: `TsvrcBehaviour` keeps its distinguishing `Tsvrc` prefix internally because a bare
`Behaviour` would collide with Unity's own
[`UnityEngine.Behaviour`](https://docs.unity3d.com/ScriptReference/Behaviour.html),
while the shadow gets the clean name (`TsBehaviour`) that your own code actually
extends.
