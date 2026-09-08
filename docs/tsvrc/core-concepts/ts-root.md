---
id: ts-root
title: TsRoot
sidebar_position: 5
---

# TsRoot

`Tsvrc.Core.Generated.TsRoot` is the abstract root every `TsvrcBehaviour` reaches through
its `_ts` field. See [How TsVRC fits together](./how-it-fits-together) for the overall
picture — this page is its full reference.

## Usage

You reach `TsRoot` through `_ts` (see [TsvrcBehaviour](./tsvrc-behaviour) for the base
class it's assigned on), never by constructing or subclassing it yourself. Because each
property can independently be `null` if its codegen module never ran, guard before using
one rather than assuming all three are populated:

```csharp
if (_ts.Memory != null)
{
    _ts.Memory.Set("score", new DataToken(0));
}
```

## Public surface

`TsRoot` declares three independent `virtual` properties, each defaulting to `null`:

- **`Instance`** — the project's `Instance` subclass instance.
- **`Memory`** — the project's `TsvrcMemory` instance.
- **`Log`** — the project's `TsvrcLogger` instance.

It is abstract and stays that way deliberately: every `TsvrcBehaviour` reaches the root only
through `_ts`, typed as `TsRoot`, never through the generated concrete type directly. The
codegen scaffold module writes a real, concrete subclass for your project (the one your
`TsBehaviour`-extending scripts actually get back once cast through the shadow class
mechanism) that overrides some or all of these three properties to return the real
instances it wires up.

## Independence of the three properties

Each property is overridden independently — a generated root that only wires up `Instance`
leaves `Memory` and `Log` returning `null`, and vice versa. Don't assume that because one is
populated, the others are too; check the specific one you need, or rely on the codegen
modules that populate them (`InstanceModule`, `MemoryModule`, `LogModule`) having actually
run for your project.

## Why this matters for your own code

You never subclass `TsRoot` yourself — the generator does that. What you interact with
directly is `_ts` (inherited from `TsvrcBehaviour`), typed as this abstract base. Calling
`_ts.Memory` or `_ts.Log` before construction, or in a project where the corresponding
codegen module hasn't wired anything up, returns `null` rather than throwing — check for
that if you're writing code that might run before your project's setup is complete.
