---
id: builtin-registrations
title: "Decision note: builtin pool and factory entries"
sidebar_position: 4
---

# Decision note: builtin pool and factory entries

Eight of TsVRC's own runtime types ship pre-registered in `TsBuiltinConfig`, the
library-wide counterpart to a project's own [`TsConfig`](../codegen/config/ts-config):
[`DataTransferer`](../networking-data/data-transfer/data-transferer),
[`TsvrcTimer`](../networking-data/tsvrc-timer),
[`PlayerTracker`](../players-tracking/player-tracker),
[`ReadyCheckProcess`](../players-tracking/ready-check-process), and
[`AutoPlayerTracker`](../players-tracking/auto-player-tracker) as pool entries;
[`HeadClipGuard`](../players-tracking/head-clip-guard) and
[`StateManager`](../game-flow/state-manager) as factory entries; and
[`RankedGameSession`](../game-flow/ranked-game-session) as a pool entry too, not just the
sub-behaviours it composes. A `[WirePool]` field or `_ts.CreateX()` call for any of these
eight works the moment you write it, with nothing to add on the Configure window's Pools
or Factories tab first. This note explains why TsVRC ships them pre-registered, and why
each one landed on Pool or Factory specifically.

## What shipping them pre-registered actually buys

`TsBuiltinConfig`'s own doc comment describes it plainly: "library-wide Globals/Pool/Factory
registrations shipped with tsvrc itself, merged with each world's own `TsConfig` at generate
time." The observable effect of that merge is what matters here: without it, using
`PlayerTracker` in your own code would need the same round trip registering one of your own
project's types does, open Configure, add it to the Pools tab, then come back to write the
`[WirePool]` field, even though every project that uses `PlayerTracker` needs it registered
the exact same way, with no project-specific choice to make. Merging TsVRC's own
registrations in ahead of a project's own removes that step for these eight types
specifically, without changing anything about how a project registers its *own* types.

## Why Pool for six of them, Factory for two

The split isn't arbitrary, and it isn't about which types happen to be networked either:
`RankedGameSession` carries `[UdonBehaviourSyncMode(BehaviourSyncMode.None)]`, the same
annotation as the two factory entries, so "does this type sync" doesn't actually separate
the two groups. The real split comes from how each generator produces an instance:

- **A pool slot is instantiated once, at edit time**, and never again. `PoolModule.Wire()`
  creates every slot the project needs and wires it directly into the matching
  `[WirePool]` field, all before the world is ever uploaded. Nothing about getting a
  pooled reference involves a runtime `Instantiate()` call.
- **A factory method clones its prefab at the moment you call it**, via an actual
  `Instantiate()` inside the generated `CreateX(parent)` method. See [the pooling
  pattern](./pooling-pattern) for why that specific operation, a runtime `Instantiate`
  call, is exactly what VRChat's own networking model can't synchronize. That's a hard
  constraint on every factory-created object, not a convention: no factory-created
  instance could correctly participate in networked gameplay regardless of what it is,
  which is exactly why [`FactoryModule`](../codegen/modules/factory-module) documents that
  restriction as a fact about the mechanism rather than a rule you're expected to
  self-enforce. `HeadClipGuard` and `StateManager` both happen to be local-only already
  (their own `BehaviourSyncMode.None`), which is what makes Factory a safe fit for them.

That difference also explains why `PlayerTracker`, `ReadyCheckProcess`,
`AutoPlayerTracker`, `TsvrcTimer`, `DataTransferer`, and `RankedGameSession` couldn't have
been factory entries instead, independent of whether they sync. `RankedGameSession` and
several of the others declare their own `[WirePool]` fields (`RankedGameSession`'s
`_lobbyTracker`, `_readyCheck`, and so on), and `PoolModule.Wire()` only ever wires
`[WirePool]` fields on objects that already exist in the scene when it runs, at edit time.
A factory-cloned instance is created later, during actual gameplay, long after that pass
ran. Its own `[WirePool]` fields would stay `null` forever: nothing re-wires them after the
fact. Pooling is the only one of the two mechanisms compatible with a type that itself
depends on further pooled types.
