---
id: construct-module
title: ConstructModule
sidebar_position: 11
---

# ConstructModule

`Tsvrc.Editor.ConstructModule` is the generator behind the [tutorial](../first-behaviour)'s
onboarding step. Registering a `TsvrcBehaviour` on the Configure window's **Constructs** tab
is what this module turns into a private field and a startup `TsConstruct` call. It's the
module directly responsible for a registered behaviour's `TsStart()` override running at
all.

## Usage

Register a `TsvrcBehaviour` on the Configure window's Constructs tab. That's the whole
configuration step: there's no name to set, since a construct never becomes a member on
`_ts`.

```csharp
public class HelloWorld : TsBehaviour
{
    protected override void TsStart()
    {
        LogInfo("HelloWorld constructed.");
    }
}
```

Registering `HelloWorld` here is what makes `TsStart` run at all. If another behaviour
needs a direct reference to it afterward, wire it the ordinary Unity way (a
`[SerializeField]` field assigned in the Inspector), or register the object as a
[Global](./global-module) instead if you also want it reachable as `_ts.Name`.

## What it generates

Each construct entry becomes a private backing field
(`[HideInInspector][SerializeField] private {Type} _construct{Name};`, `{Name}` derived from
the entry's type and never user-facing) plus, inside `_TsConstructStart()`, a
`{FieldName}.TsConstruct(this);` call. Nothing else: no public accessor, no member name to
configure, no group-based namespacing. Registering a construct under a group in the
Configure window's tree view is purely organizational.

## Naming and requirements

A construct must be a component and must be a `TsvrcBehaviour`. `EntryPolicy` enforces both
(`RequireComponent`/`RequireTsvrcBehaviour`), unlike Global, which accepts any scene object.
Because the field is never exposed, its name is always derived from the component's type
(disambiguated by `ResolveEntries`' own suffix dedup on a collision), never from an explicit
entry name. There isn't one to set.

## Construct vs. Global

Both modules can initialize a `TsvrcBehaviour`: `GlobalModule` also calls `TsConstruct` when
a Global entry's type happens to be one. The difference is what each is actually for.

- **Construct** guarantees initialization, a defined build order and a `TsStart` call, and
  stops there. The reference stays private, so it never participates in `_ts.Name` collision
  detection with Global, Instance, or any other module.
- **Global** guarantees a name, `_ts.Name`, reachable from anywhere, for any scene object
  whether or not it's a `TsvrcBehaviour`. Construction only happens as a side effect, when
  the registered type needs it so the reference isn't left uninitialized.

Register something as a Construct when you only need it initialized. Register it as a
Global when you need to reach it by name from other behaviours. Register it as both if you
need both: the two no longer collide, since only Global ever claims a name.
