---
id: sync-model
title: "Decision note: the shared-memory and sync model"
sidebar_position: 3
---

# Decision note: the shared-memory and sync model

Every Core type that replicates state, such as [`TsvrcMemory`](../networking-data/tsvrc-memory)
and [`Process`](../core-concepts/process), uses the same two pieces: the VRChat manual sync mode
(`BehaviourSyncMode.Manual`) and an explicit `RequestSerialization()` call after each change. This
note explains why.

## Manual sync, sent on demand

[VRChat describes the two sync
modes](https://creators.vrchat.com/worlds/udon/networking/variables/#2-manual-sync) this way: manual
sync "requires calling `RequestSerialization()` to send data updates" and suits values that don't
change often, while continuous sync "updates automatically" and suits "frequently updated values."
State in the Core types changes in discrete steps, such as a process starting, a timer pausing or a
player joining a tracked set, not continuously like a transform position. Each change has a clear
moment to send it, so there's no reason to pay for automatic periodic replication.

## The resync heartbeat

`Process` adds a second mechanism: while a process runs, its owner sends its full synced state
again every 5 seconds, whether or not anything changed. The lifecycle broadcasts of the Core process
types are discrete `[NetworkCallable]` events with no delivery confirmation, and a client that misses
one has no other way to catch up. The VRChat docs document one case where events are lost: when
players in one instance run different world versions, [the server "may silently drop events and not
deliver
them"](https://creators.vrchat.com/worlds/udon/networking/events/#mismatched-world-versions-in-the-same-instance).
The heartbeat doesn't depend on knowing which case happened: a client that missed a broadcast gets
the current synced state within a few seconds, with no acknowledgement or retry logic. See
[`Process`](../core-concepts/process#the-tick-loop) for the loop that sends it.

## Working around what can't be synced directly

The synced tier of `TsvrcMemory` exists because `DataDictionary`, the natural shape for a key-value
store, isn't a syncable type. [The types synced variables
support](https://udonsharp.docs.vrchat.com/vrchat-api/#synced-variables) are primitives, the small
Unity value types (`Vector2`, `Vector3`, `Vector4`, `Quaternion`, `Color`), strings and `VRCUrl`.
`TsvrcMemory` serializes the dictionary to a string with [`TsJson`](../utilities/ts-json) before
each synced write and parses it back in `OnDeserialization`, and that string field follows the same
manual sync pattern as any other synced value. See [`TsvrcMemory`](../networking-data/tsvrc-memory)
for what the synced tier guarantees about ordering and delivery.

## Ownership

Core uses the [VRChat ownership
model](https://creators.vrchat.com/worlds/udon/networking/ownership/#how-ownership-works) as it is:
only "the owner of a networked object can modify its synchronized Udon variables," so only the
owner sends state to other players. There's no second ownership concept on top of it.

The types differ in how a write from another player reaches the owner:

- `TsvrcMemory` takes ownership for the local player before it writes a synced key.
- `Process` never takes ownership by itself. A lifecycle call from another player is sent to the
  owner over the network, and the owner applies it. A subclass that should run on the player who
  starts it [takes ownership first](../core-concepts/process#lifecycle).
