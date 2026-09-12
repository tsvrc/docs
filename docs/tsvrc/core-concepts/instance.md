---
id: instance
title: Instance
sidebar_position: 3
---

# Instance

`Tsvrc.Core.Instance` is the `TsvrcBehaviour` subclass representing the running world
instance itself. It's what you'd reach for to ask "am I the [instance
master](https://creators.vrchat.com/worlds/udon/networking/ownership/#the-instance-master)?" or to hook
startup logic that should run once for the instance as a whole. Its generated
shadow class is `TsInstance`. Your project's actual instance type is a subclass of that
shadow, discovered and wired automatically by `InstanceModule`. There's exactly one per
project; see that module's own reference page for how it's found.

## Usage

Override `OnInstanceStart` for setup that should run once the instance itself is ready,
and `IsTsMaster` only if the project needs a notion of "host" that differs from VRChat's
own instance master:

```csharp
public class GameInstance : TsInstance
{
    protected override void OnInstanceStart()
    {
        LogInfo("Instance started.");
    }
}
```

## Public surface

- **`IsTsMaster`** — a `virtual bool`, currently a thin wrapper over VRChat's own
  [`Networking.IsMaster`](https://udonsharp.docs.vrchat.com/vrchat-api/#networking). It's
  a real, working default today, not a stub that throws, so a project with no special
  master logic doesn't need to touch it. Treat the name and the logic behind it as a
  placeholder, though: TsVRC's plan is real master management of its own, independent of
  VRChat's instance master, and this property will change to reflect that before 1.0.
  Override it now if your world needs different master logic in the meantime, but expect
  to revisit that override later. Before gating any world feature on master status at
  all, note that [VRChat itself recommends against
  it](https://creators.vrchat.com/worlds/udon/networking/ownership/#best-practices): prefer an ownership
  check where one is available.
- **`OnInstanceStart()`** — a `virtual void`, empty by default. This is where
  instance-level startup logic goes.

## How OnInstanceStart differs from TsStart

`Instance` deliberately doesn't override `TsvrcBehaviour.TsStart()`. Here's why that
matters: `TsConstruct` only ever calls `TsStart`, so if `Instance` reused it for its own
startup hook, every `TsConstruct` call anywhere would accidentally trigger instance
startup too, with no way to tell the two apart. Generated code calls `OnInstanceStart()`
as a separate, explicit step instead, right after construction. They're two different
events on purpose, not two names for the same thing.

That also means calling `OnInstanceStart()` yourself, outside the generated call path,
does nothing useful. It's a plain method like any other, not something wired to fire on
its own.

## Edge cases worth knowing

`IsTsMaster`'s default implementation reads live VRChat networking state. Call it outside
a real running instance, say directly in an editor test with no network context, and it
won't throw. It also won't mean anything: the property is safe to call in a non-runtime
environment, just not meaningful there.
