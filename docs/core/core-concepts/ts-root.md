---
id: ts-root
title: TsRoot
sidebar_position: 5
---

# TsRoot

`Tsvrc.Core.Generated.TsRoot` is the abstract root every `TsvrcBehaviour` reaches through
its `_ts` field. See [How TsVRC fits together](./how-it-fits-together) for the overall
picture. This page is its full reference.

## Usage

You reach `TsRoot` through `_ts` (see [TsvrcBehaviour](./tsvrc-behaviour) for the base
class it's assigned on). You never construct or subclass it yourself. Because each
property can independently be `null` if its codegen module never ran, guard before using
one rather than assuming all three are populated:

```csharp
if (_ts.Memory != null)
{
    _ts.Memory.Set("score", new DataToken(0));
}
```

## Public surface

`TsRoot` declares three independent `virtual` properties, each defaulting to `null`
until a codegen module fills it in:

- **`Instance`** — your project's [`Instance`](./instance) subclass.
- **`Memory`** — your project's [`TsvrcMemory`](../networking-data/tsvrc-memory)
  component.
- **`Log`** — your project's [`TsvrcLogger`](../utilities/tsvrc-logger) component.

`TsRoot` stays abstract on purpose. Every `TsvrcBehaviour` reaches it only through
`_ts`, and `_ts` is always typed as this abstract base, not as your project's actual
generated class. That's what lets the runtime assembly compile on its own, before your
project's generated code exists yet: `TsvrcBehaviour` only ever depends on `TsRoot`, so
it never needs to know about a generated class that hasn't been written.

A generator module called `ScaffoldModule` writes that real, concrete subclass for your
project. It's the type your `TsBehaviour`-extending scripts actually get back once
TsVRC retypes `_ts` for them (see [How TsVRC fits
together](./how-it-fits-together#why-a-generation-step-exists-at-all) for how that
retyping works).

`ScaffoldModule` itself doesn't fill in `Instance`, `Memory`, or `Log`, though. Three
other modules each contribute one override to that same generated class, and only if
they actually ran for your project: `InstanceModule` writes `Instance`, and
`LogModule`/`MemoryModule` write `Log`/`Memory` through a shared base they both extend,
`TsSingleComponentModule`.

## A missing property isn't the only way this can go wrong

`_ts` itself is `null` until [`TsConstruct`](./tsvrc-behaviour#construction) has run on
a behaviour. Calling `_ts.Memory` before that point throws a `NullReferenceException` on
`_ts`, not a graceful `null`. Once construction has happened, `_ts` is always a real
object, so from that point on, a property that's unpopulated because its codegen module
never ran returns `null` cleanly instead, exactly like the check in Usage above expects.
