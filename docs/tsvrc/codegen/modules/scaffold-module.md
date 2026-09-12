---
id: scaffold-module
title: ScaffoldModule
sidebar_position: 9
---

# ScaffoldModule

`Tsvrc.Editor.ScaffoldModule` generates and owns `TsGenerated.cs`, the project-specific
concrete subclass of [`TsRoot`](../../core-concepts/ts-root) every other module's generated
fragment extends via the `partial class` mechanism. It always writes first and must compile
before any other module's `Wire()` pass can locate the root object, since every other module
finds the scene root through `ScaffoldModule.FindCompiledType()`.

## What it generates

The scaffold file declares `public partial class TsGenerated : TsRoot`, a `Start()` method
that calls every subsystem's generated `_Ts*Start()` method in a fixed order
(`_TsLogStart`, `_TsMemoryStart`, `_TsGlobalStart`, `_TsPoolStart`, `_TsConstructStart`,
`_TsInstanceStart`), and one generated shadow class per framework type carrying
[`[TsWorldExtensionPoint]`](../../core-concepts/attributes.md). This is the mechanism that
produces `TsBehaviour`, `TsInstance`, and every other shadow class your own scripts actually
extend, discovered entirely by reflecting over that attribute rather than a hardcoded list.

## The self-healing scene object

`AfterFilesStable()` ensures the compiled scaffold type's own `UdonSharpProgramAsset`
exists, creates or repairs the scene root object carrying it
(`EnsureRootSceneObject`), and creates the child [`TsConfig`](../config/ts-config)
object (tagged `EditorOnly` so it's stripped from the actual VRChat build) if it's missing.
Finding more than one instance of the compiled type logs a warning naming exactly which one
survives and which are destroyed, so a puzzled "where did my duplicate's settings go"
moment (say, after a Ctrl+D) has a trail to follow in the console, rather than silently
picking one.

## Auto-linking the scene

The very first successful bootstrap in a project auto-links
[`TsLinkedScene`](../config/linked-scene) to the scene it just scaffolded, rather than
leaving that corruption-safety net an indefinitely manual opt-in. It's a no-op once anything
is already linked, including a second bootstrap attempt within the same pass, since once a
scene is linked, the generator's own "linked scene not loaded" guard refuses to touch any
other scene at all, so a second scene can never silently grow a competing scaffold of its
own.

## Deterministic program asset field order

`NormalizeProgramAsset` sorts an `UdonSharpProgramAsset`'s internal field-definition
dictionary into a stable order after every pass. Unity/UdonSharp's own serialization of that
dictionary isn't guaranteed to stay in the same order across compilations, which without
this normalization would produce a spurious file diff on every single domain reload even
when nothing about the actual fields changed. That's noisy for version control and confusing
for anyone trying to tell whether a regenerate actually changed anything.
