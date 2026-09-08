---
id: pool-module
title: PoolModule
sidebar_position: 10
---

# PoolModule

`Tsvrc.Editor.PoolModule` is the generator behind [`WirePoolAttribute`](../core-concepts/attributes.md):
it decides how many instances of each pooled prefab a project actually needs, generates one
serialized slot field per instance, and instantiates and wires them all under a `"Pool"`
child at wire time. This is the densest of the ten modules — the slot-count math is a real
dependency graph, not a flat per-type count.

## Usage

Register the prefab's type as a pool entry (Configure window, Pools tab), then declare a
field for it wherever an instance is needed:

```csharp
[WirePool][SerializeField] private RoundTimer _roundTimer;
```

`Wire()` fills `_roundTimer` in with one of the generated slot instances — nothing else to
call. A pooled type that itself needs another pooled type follows the same pattern one level
down: put a `[WirePool]` field on the pooled behaviour itself, and the dependency-graph math
above accounts for it automatically.

## Registering a pool type

`TsConfig.PoolEntries`/`TsBuiltinConfig.PoolEntries` register which `UdonSharpBehaviour`
prefabs are poolable at all. Registration alone creates zero slots — a type with no
`[WirePool]` field anywhere referencing it resolves to `TotalSlots == 0` and is silently
skipped in generated output. Slots exist only because something asked for them.

## How many slots: a dependency graph, not a flat count

A `[WirePool]` field can appear two places: on an ordinary scene behaviour (an **external**
reference — "give me one instance of this pooled type"), or on *another pooled type itself*
(an **internal** dependency — "each instance of pool type P needs its own instance of pool
type Q"). The total slot count for type `T` is:

```
totalSlots(T) = externalCount(T) + Σ_P  (fields-in-P-referencing-T) × totalSlots(P)
```

computed via a topological walk (`ComputeForType`, memoized, cycle-detected) so a parent
pool type's own slot count is always resolved before a child dependency's count that depends
on it. A genuine circular dependency between pool types (P needs Q, Q needs P) is detected
and logs an error, excluding the offending type from generation rather than recursing
forever.

Every `[WirePool]` field whose type was never registered as a pool entry logs a warning
(deduplicated per declaring-type-plus-field, so a scene with many instances of the same
behaviour only logs once) — without it, that field would just stay `null` forever at
runtime with no indication why, disconnecting the symptom from a forgotten registration.

## Generated shape and wiring

Each slot becomes `[HideInInspector][SerializeField] private {Type} _pool_{Type}_{index};`,
and `_TsPoolStart()` calls `TsConstruct(this)` on every slot whose type is a
`TsvrcBehaviour`. At wire time, `Wire()` instantiates every slot under a `"Pool"` child
(created lazily, only once a slot actually needs it), assigns each instance to its own
scaffold field, then makes a second pass to assign every `[WirePool]` field across the scene
— including internal dependencies inside other pool instances themselves — to its matching
freshly-created slot. A slot/target-count mismatch (more or fewer `[WirePool]` targets than
generated slots) is a warning, not a hard failure, since either mismatch usually self-heals
on the very next pass once the scene or field declarations catch up.

## Wiring is skipped, not partially applied, on a broken compile

Unlike Global, Factory, and Construct — none of which destroy existing scene state on empty
input — `PoolModule.Wire()` has real destructive potential: an empty-looking `_poolEntries`
would otherwise tear down a genuinely populated `"Pool"` container. Because `TotalSlots`
itself comes from a live, scene-wide reflection scan (`ScanExternalRefs`/`ScanInternalDeps`)
that's just as fragile to a broken compile as any other live scan, a pass that had to fall
back to the cached snapshot (`_usedSnapshotFallback`) makes `Wire()` do nothing at all,
leaving whatever is already wired in the scene completely alone until a clean compile
restores a trustworthy live count.

## Already-wired detection

Before tearing anything down, `Wire()` checks `IsPoolAlreadyWired` — matching slot count,
matching prefab source per slot (via `PrefabUtility.GetCorrespondingObjectFromSource`), and
matching field assignments — and skips the whole rebuild if everything already matches. This
avoids destroying and recreating every pool instance (losing any in-scene state on them) on
a pass where nothing about the pool configuration actually changed.
