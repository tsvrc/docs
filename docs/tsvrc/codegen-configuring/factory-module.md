---
id: factory-module
title: FactoryModule
sidebar_position: 12
---

# FactoryModule

`Tsvrc.Editor.FactoryModule` generates a `Create{Name}(Transform parent)` method per
registered prefab, for on-demand, **non-networked** runtime instantiation.
`TsConfig.FactoryEntries`/`TsBuiltinConfig.FactoryEntries` register the prefabs; builtin
entries are resolved first so a name collision between a builtin and a project's own factory
always suffixes the project's, never the builtin's.

## Usage

Register a prefab on the Configure window's Factory tab, then spawn instances by calling the
generated method from any behaviour:

```csharp
var vfx = _ts.CreateHitSpark(transform);
```

Reach for this only for local, non-networked objects (see below) — a projectile or one-off
UI popup, not anything other players need to see.

## Naming always includes the full group chain

Unlike Global, where `IncludeInName` makes group-based namespacing an opt-in per group (and
Construct, which has no generated name to namespace at all), a Factory entry's generated
method name is **always** prefixed by its full group ancestor chain — a prefab named "Bolt" inside a group "Enemies" nested inside "Boss" becomes
`CreateEnemiesBossBolt(parent)`, unconditionally. There's no toggle to opt out, since the
whole point of Factory grouping is organizing what would otherwise be a large flat method
namespace.

The same prefab registered under two differently-named groups (for example, both an
"Enemies" group and a "Traps" group spawning the same projectile prefab) is a legitimate,
common case, not a mistake — so, unlike Pool's duplicate-reference detection,
`FactoryModule` deliberately does *not* flag a prefab appearing more than once across
different registrations.

## Generated method shape

```csharp
public {Type} Create{Name}(Transform parent)
{
    var go = (GameObject)Instantiate(_factory{Name}, parent);
    if (go == null) return null;
    go.SetActive(true);
    // for a TsvrcBehaviour prefab:
    var instance = go.GetComponent<{Type}>();
    if (instance != null) instance.TsConstruct(this);
    return instance;
    // for a plain GameObject prefab, returns go directly instead
    // for any other component type, returns go.GetComponent<{Type}>() directly, uncostructed
}
```

The instantiation source (`_factory{Name}`) is itself a **pre-instantiated, inactive**
instance under a `"Factories"` scene child, not the original prefab asset — `Wire()` creates
one inactive instance per registered factory once, at wire time, and `Create{Name}` clones
*that* instance at call time via `Instantiate`, rather than instantiating the original
prefab asset directly on every call.

## No networking, by design

The Configure window's own tab description states this plainly: an object created through a
Factory method never receives a VRChat network ID and can't send or receive network events.
Use [`PoolModule`](./pool-module) instead for anything that needs to participate in
networked gameplay — Factory exists specifically for cheap, purely local, on-demand
instantiation (VFX, local UI popups) where networking would be unnecessary overhead.
