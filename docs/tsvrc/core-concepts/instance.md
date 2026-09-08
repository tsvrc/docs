---
id: instance
title: Instance
sidebar_position: 3
---

# Instance

`Tsvrc.Core.Instance` is the `TsvrcBehaviour` subclass representing the running world
instance itself — the thing you'd reach for to ask "am I the master of this instance?" or
to hook world-instance-level startup logic. Its generated shadow class is `TsInstance`;
your project's actual instance type is a subclass of that shadow, discovered and wired by
`InstanceModule` (there's exactly one per project — see that module's own reference page
for how it's found).

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

- **`IsTsMaster`** — a `virtual bool`, defaulting to VRChat's own
  `Networking.IsMaster`. Override it if your world needs custom master logic (for example,
  a designated "host" that isn't necessarily VRChat's instance master). The base
  implementation is a real default, not a placeholder that throws — a project with no
  special master logic doesn't need to touch this at all.
- **`OnInstanceStart()`** — a `virtual void`, empty by default. This is where
  instance-level startup logic goes.

## How OnInstanceStart differs from TsStart

`Instance` does **not** override `TsvrcBehaviour.TsStart()`. That's deliberate, not an
oversight: `TsConstruct` only ever calls `TsStart`, so if `Instance` used `TsStart` for its
own startup hook, every `TsConstruct` call would automatically trigger instance startup
logic with no separate signal. Instead, generated code calls `OnInstanceStart()` explicitly,
as its own step, after construction — the two are separate calls on purpose, not two names
for the same event. Calling `OnInstanceStart()` yourself outside of that generated call path
does nothing useful; it's a plain method, not something wired to fire automatically.

## Edge cases worth knowing

`IsTsMaster`'s default implementation reads live VRChat networking state, so calling it
outside of an actual running instance (for example, directly in an editor test with no
network context) doesn't throw, but doesn't reflect anything meaningful either — the
property is safe to call, not necessarily meaningful, in non-runtime environments.
