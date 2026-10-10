---
id: pooling-pattern
title: "Decision note: the pooling pattern"
sidebar_position: 2
---

# Decision note: the pooling pattern

[`WirePoolAttribute`](../core-concepts/attributes.md) and [`PoolModule`](../codegen/modules/pool-module)
compute how many instances of each poolable prefab a project needs, and instantiate exactly
that many into the scene as generated content: at edit time, wired and saved as part of the
scene, rather than instantiated on demand while the world is running. This mirrors a
constraint documented directly in VRChat's own creator documentation, not an arbitrary design
preference.

## The documented constraint

[UdonSharp's own networking
guidance](https://udonsharp.docs.vrchat.com/networking-tips-&-tricks/) states plainly, under
its "Instantiation" heading, that "instantiated objects cannot be correctly synchronized,"
and that "the only workaround is to use object-pooling": pre-placing a fixed set of objects
in the scene ahead of time and toggling their active state at runtime instead of creating
new ones. [VRChat's own `VRCObjectPool`
component](https://udonsharp.docs.vrchat.com/vrchat-api/#vrcobjectpool) documents doing
exactly that: it "manage[s] and synchronize[s] the active state of each object it holds,"
handing one out via a spawn call and returning it later rather than ever instantiating or
destroying anything at runtime. That's the same model `PoolModule` follows for `[WirePool]`
fields.

## What this means for TsVRC's own design

Because a networked, poolable object has to already exist in the scene before the world
starts, "how many instances do we need" has to be answered before runtime, not lazily as
demand appears. There's no safe way to spin up a new synced instance of a type on demand
once players are already in the instance. `PoolModule`'s slot-count computation (see its own
reference page for the dependency-graph math) exists to answer that question as accurately
as possible at edit time, from real usage found in the project: how many places actually
declare a `[WirePool]` field for a given type, including other pooled types that themselves
depend on further pooled types.

This page deliberately doesn't go further and explain the lower-level mechanism, for
example exactly why VRChat's networking model ties an object's ability to be owned and
synced to it having existed since before the scene loaded. That's a real, documented rule
(the constraint above is directly stated in VRChat's own docs), but the deeper "why" at the
level of how network IDs get allocated isn't something either UdonSharp's public
documentation or its compiler source spells out in enough detail to state as fact here.
Treat the rule itself as solid; treat any explanation of the underlying networking mechanics
beyond it as unverified.
