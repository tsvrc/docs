---
id: spawning-a-local-object
title: Spawn a local, non-networked object on demand
sidebar_position: 14
---

# Spawn a local, non-networked object on demand

How to instantiate your own prefab at runtime for something purely local (a hit-spark
VFX, a one-off UI popup), using [`FactoryModule`](../codegen/modules/factory-module)
instead of `Instantiate`.

Reach for this only when the object doesn't need to be seen by other players. For
anything a networked, [pool a prefab](./pooling-a-prefab) instead: a factory-created
object never receives a VRChat network ID and can't send or receive network events.

## Steps

1. Register the prefab on the Configure window's **Factories** tab, inside a group if
   you want its generated method name namespaced.
2. Click **Apply** in the Configure window's pending-changes footer. **Force Regenerate**
   and the automatic trigger both stay disabled while this edit is unapplied, so Apply is
   what actually runs codegen here; see [`TsWindow`](../codegen/config/ts-window#apply--discard)
   for why, or [try it on a live mockup of the window](../codegen/config/ts-window#try-it).
   `FactoryModule` then generates one `Create{Group}{Name}(Transform parent)`
   method per registered prefab.
3. Call it wherever you need a fresh instance:

   ```csharp
   public class HitEffectSpawner : TsBehaviour
   {
       public void PlayHitEffect(Vector3 position)
       {
           var vfx = _ts.CreateHitSpark(transform);
           vfx.transform.position = position;
       }
   }
   ```

   The returned instance is already active and, if the prefab's root is a
   `TsvrcBehaviour`, already `TsConstruct`ed. A plain `GameObject` prefab with no
   `TsvrcBehaviour` root returns the `GameObject` itself instead of a typed component.

## Registering the same prefab under more than one group

Spawning the same prefab from two different named groups (an "Enemies" group and a
"Traps" group both spawning the same projectile, say) is a legitimate, supported case,
not flagged as a conflict: each group gets its own, separately-named `Create` method for
the same prefab.

## Why this shape

See [`FactoryModule`'s reference page](../codegen/modules/factory-module) for how the
instantiation source is a pre-instantiated, inactive template rather than the raw prefab
asset, and why that specific detail is what makes factory-created objects fast to spawn
repeatedly. See [Decision note: builtin pool and factory entries](../explanations/builtin-registrations)
for the deeper reason a factory-created object can never be synced, not just a rule to
follow but a consequence of how `Instantiate` itself works in Udon.
