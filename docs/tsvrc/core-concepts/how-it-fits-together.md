---
id: how-it-fits-together
title: How TsVRC fits together
sidebar_position: 1
---

# How TsVRC fits together

An explanation of the shape of TsVRC: the split between what happens in the Unity editor
and what happens at runtime in the world, and how the pieces you meet in
[the first-behaviour tutorial](../first-behaviour) relate to each other. Read this once,
then come back to it from any module's reference page instead of re-deriving the big
picture there.

## Two halves: codegen-time and run-time

TsVRC is really two things wearing one package name.

The **codegen half** lives entirely in the Unity editor, under `Editor/CodeGen`. It reads
what you've configured through **Tsvrc > Configure**: which behaviours you've registered
as constructs, which pools exist, which globals are exposed. Then it writes plain C#
files into your project. That configuration always comes from exactly one linked scene
per project, never whatever scene happens to be open (see
[TsLinkedScene](../codegen-configuring/linked-scene)). Nothing in this half ships in the
built world; it only ever runs while you're editing.

The **runtime half** lives under `Runtime/` and is ordinary UdonSharp. Some of its types,
like `TsvrcBehaviour` and `Instance`, are base classes your world's scripts extend, always
through a generated shadow rather than directly (the next section covers why). Others,
like `TsvrcMemory`, are services your scripts call into through `_ts` without ever
subclassing them. This is the part that runs for players.

The generated files are the bridge between the two: they're real, checked-in-looking C#
that extends the runtime half and gets compiled by Unity like any other script. You never
hand-write them, and re-running codegen regenerates them from your configuration each
time.

## Why a generation step exists at all

A framework like this usually wants two things: a container that can look up "give me the
instance of type X that's registered right now," and typed access to whichever concrete
subclasses a given project happens to define. Both are usually built with runtime
reflection or dependency injection. TsVRC builds both at edit time instead: the codegen
pass inspects your project's own types and configuration while you're still in the
editor, then bakes the result into generated code with direct references and calls, not
lookups.

This page won't assert a specific reason UdonSharp forces that choice. That claim needs
checking against UdonSharp's own compiler behavior before it's stated as fact, and it's
tracked as its own explanation page once enough of the runtime modules are documented to
ground the comparison concretely. What you can rely on today: every extension point is
generated, not resolved at runtime. That's why your own scripts extend a generated shadow
class (`TsBehaviour`, `TsInstance`, and so on) instead of the framework class directly:
the shadow is what carries your project's concrete types.

## What the root object bootstraps

`TsRoot` is the framework's own root type: an abstract class exposing `Instance`,
`Memory`, and `Log`. It's not something you extend yourself. The generator's scaffold
module generates a concrete subclass for your project and creates the scene object that
carries it. Every `TsvrcBehaviour` in your world holds a reference to that one object
(`_ts`), assigned once when the behaviour is constructed, and reaches the rest of the
framework through it: `_ts.Memory` for shared state, `_ts.Log` for logging, `_ts.Instance`
for instance-level concerns like master detection.

That's also why construction is a distinct step from `Awake`/`Start`: a `TsvrcBehaviour`
doesn't have a working `_ts` reference until something explicitly calls `TsConstruct` on
it, which is what registering a behaviour as a construct (or a pool member, or a factory
product) in **Tsvrc > Configure** arranges for the generated code to do. A behaviour
that's sitting in the scene but never registered anywhere never gets constructed, and any
of its `TsStart` logic never runs.

## Where to go from here

Module reference pages assume you've read this page. If you're looking for how a specific
runtime type behaves in detail, or how a specific codegen module decides what to generate,
start from that module's own reference page rather than this one.
