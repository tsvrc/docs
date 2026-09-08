---
id: pooling-pattern
title: "Decision note: the pooling pattern"
sidebar_position: 2
---

# Decision note: the pooling pattern

[`WirePoolAttribute`](../core-concepts/attributes.md) and [`PoolModule`](../codegen-configuring/pool-module)
compute how many instances of each poolable prefab a project needs, and instantiate exactly
that many into the scene as generated content — at edit time, wired and saved as part of the
scene, rather than instantiated on demand while the world is running. This mirrors a
constraint documented directly in VRChat's own creator documentation, not an arbitrary design
preference.

## The documented constraint

VRChat's own UdonSharp networking guidance states plainly that instantiating GameObjects at
runtime does not produce synced objects: an object created with `Instantiate` while a world
is running cannot be correctly synchronized between clients. The officially recommended
workaround is object pooling — pre-placing a fixed set of objects in the scene ahead of
time and toggling their active state at runtime instead of creating new ones, which is
exactly what VRChat's own built-in object-pooling component does, and exactly the model
`PoolModule` follows for `[WirePool]` fields.

## What this means for TsVRC's own design

Because a networked, poolable object has to already exist in the scene before the world
starts, "how many instances do we need" has to be answered before runtime, not lazily as
demand appears — there's no safe way to spin up a new synced instance of a type on demand
once players are already in the instance. `PoolModule`'s slot-count computation (see its own
reference page for the dependency-graph math) exists to answer that question as accurately
as possible at edit time, from real usage found in the project: how many places actually
declare a `[WirePool]` field for a given type, including other pooled types that themselves
depend on further pooled types.

This page deliberately doesn't go further and explain the lower-level mechanism — for
example, exactly why VRChat's networking model ties an object's ability to be owned and
synced to it having existed since before the scene loaded. That's a real, documented rule
(the constraint above is directly stated in VRChat's own docs), but the deeper "why" at the
level of how network IDs get allocated isn't something either UdonSharp's public
documentation or its compiler source spells out in enough detail to state as fact here.
Treat the rule itself as solid; treat any explanation of the underlying networking mechanics
beyond it as unverified.
