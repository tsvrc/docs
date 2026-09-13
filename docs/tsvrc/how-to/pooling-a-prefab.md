---
id: pooling-a-prefab
title: Pool a prefab instead of instantiating it
sidebar_position: 2
---

# Pool a prefab instead of instantiating it

How to get a networked-safe instance of a behaviour at runtime, using
[`[WirePool]`](../core-concepts/attributes.md#wirepoolattribute) and
[`PoolModule`](../codegen/modules/pool-module) instead of `Instantiate`. See
[the pooling pattern](../explanations/pooling-pattern) for why `Instantiate` isn't an option
here at all.

## Steps

1. Register the prefab's type as a pool entry on the Configure window's **Pools** tab (backed
   by `TsConfig.PoolEntries`), then click **Apply** in the window's pending-changes
   footer. That's a direct edit to `TsConfig` made through the window, so it's batched
   behind Apply/Discard like any other Configure tab edit: see
   [`TsWindow`](../codegen/config/ts-window#apply--discard) for why. Registration alone
   creates no slots yet, since nothing references the type as `[WirePool]` yet.
2. Declare a `[WirePool]` field for it on whatever behaviour needs an instance:

   ```csharp
   public class EnemySpawner : TsBehaviour
   {
       [WirePool("used when a wave spawns an enemy")]
       public EnemyController slot;

       [SerializeField] private Transform spawnPoint;
   }
   ```

   This is a code change, not a Configure window edit, so it needs no Apply click at all:
   once Unity finishes compiling, TsVRC's generator runs automatically and discovers the
   field by reflection. `PoolModule` computes how many total slots the project needs
   across every `[WirePool]` field referencing this type, generates one serialized field
   per slot, and instantiates and wires them all under a `"Pool"` container at wire time.
3. Use the field like any other reference once the scene has regenerated. It's already a
   real, scene-resident instance by the time your code runs, not something you create:

   ```csharp
   protected override void TsStart()
   {
       slot.BeginPatrol(spawnPoint);
   }
   ```

## Pooling a type that itself needs a pooled dependency

A pooled type can declare its own `[WirePool]` field for a second pooled type.
`PoolModule` resolves the dependency graph so the second type's slot count accounts for
every instance of the first:

```csharp
public class EnemyController : TsvrcBehaviour
{
    [WirePool]
    public HitEffect impactEffectSlot; // one HitEffect instance per EnemyController instance
}
```

## If the slot stays null

Check the Console for a `PoolModule` warning first: a `[WirePool]` field whose type was
never registered on the Pools tab logs a warning and leaves the field `null` forever,
rather than failing generation outright. Registering the type and regenerating resolves
it.

If the field's type is one of TsVRC's own runtime types (`PlayerTracker`, `TsvrcTimer`,
and four others), skip step 1 entirely: it's already registered for you. See [Decision
note: builtin pool and factory entries](../explanations/builtin-registrations).

## Why this shape

See [the pooling pattern](../explanations/pooling-pattern) for the underlying VRChat
networking constraint this works around, and [`PoolModule`'s reference page](../codegen/modules/pool-module)
for the exact slot-count formula and what happens on a broken compile mid-generation.
