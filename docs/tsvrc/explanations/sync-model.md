---
id: sync-model
title: "Decision note: the shared-memory and sync model"
sidebar_position: 3
---

# Decision note: the shared-memory and sync model

Every networked TsVRC type that needs to replicate state —
[`TsvrcMemory`](../networking-data/tsvrc-memory), [`Process`](../core-concepts/process) and everything built on
it, [`TsvrcTimer`](../networking-data/tsvrc-timer) — uses the same two ingredients: VRChat's manual
sync mode (`BehaviourSyncMode.Manual`) plus an explicit `RequestSerialization()` call
whenever something changes, rather than VRChat's automatic continuous sync. This note ties
together why that combination is the framework's consistent default, synthesizing what each
individual type's own reference page already establishes rather than introducing new claims.

## Manual sync, sent on demand

Manual sync mode replicates a behaviour's synced fields only when the owner explicitly
calls `RequestSerialization()`, rather than on VRChat's own automatic periodic schedule.
Every TsVRC type built on `Process` uses this deliberately: state changes in these types are
discrete events (a process starts, a timer pauses, a player gets added to a tracked set),
not continuously-varying values like a transform position, so there's a well-defined moment
to trigger a sync rather than a reason to pay for automatic per-frame replication.

## The self-healing resync heartbeat

`Process` layers a second mechanism on top of that: while a process is running, its owner
re-broadcasts its full synced state on a slower, independent cadence (every 5 seconds),
regardless of whether anything actually changed since the last discrete send. This exists
specifically because the discrete, event-driven `[NetworkCallable]` broadcasts TsVRC's own
process types use for lifecycle notifications aren't delivery-confirmed — a client that
missed one has no other way to catch up. The periodic full resync means a missed broadcast
self-heals within a few seconds on its own, without any acknowledgement or retry logic
needed anywhere in the framework. See [`Process`](../core-concepts/process) for the full mechanics,
including how ownership recovery interacts with this heartbeat when the previous owner
leaves mid-run.

## Working around what can't be synced directly

`TsvrcMemory`'s synced tier exists specifically because `DataDictionary` — the natural
representation for an arbitrary key-value store — isn't itself a type UdonSync can
replicate. Serializing it to a plain string via [`TsJson`](../utilities/ts-json) before every
synced write, and parsing it back on `OnDeserialization`, is the accommodation: everything
about the manual-sync-plus-`RequestSerialization` pattern above still applies to that string
field itself, exactly as it would to any other synced value. See
[`TsvrcMemory`](../networking-data/tsvrc-memory) for what is and isn't guaranteed about ordering and
delivery for the synced tier specifically — this note doesn't repeat those specifics, only
the shared pattern behind them.

## Ownership follows the same convention throughout

Every one of these types transfers object ownership to the local player before writing a
value it wants that write to propagate — `TsvrcMemory.Set` on a synced key,
`Process.SetProcessOwner`, and so on — since only the current Unity owner of an object can
have its `RequestSerialization` calls actually produce an outbound sync. This is the same
underlying VRChat ownership model in every case; TsVRC doesn't introduce a second ownership
concept of its own, it just applies VRChat's existing one consistently everywhere state
needs to move between clients.
