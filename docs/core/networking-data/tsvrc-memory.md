---
id: tsvrc-memory
title: TsvrcMemory
sidebar_position: 1
---

# TsvrcMemory

`Tsvrc.Utils.TsvrcMemory` is TsVRC's shared key-value store, reached through `_ts.Memory`.
Its generated shadow class is `TsMemory`. It holds every key in exactly one of three
isolated tiers, ephemeral, persistent, or synced, and the tier is a per-key decision you
make once, before you ever write a value. See [Persist a value across
visits](../how-to/persisting-a-value) for a task-oriented walkthrough.

## The three tiers

- **Ephemeral** (the default). Local to this client only, and gone when the player leaves
  the world. Any key you never call `Register` on lives here.
- **Persistent.** Backed by VRChat's `PlayerData`, so it survives across sessions for the
  local player. Declared with `Register(key, persist: true, synced: false)`.
- **Synced.** Replicated to every player over the network. Declared with
  `Register(key, persist: false, synced: true)`.

A key can be exactly one of these, never a combination: `Register("k", true, true)` logs
an error and registers nothing. Registration only declares intent. It doesn't move or
migrate any value a key might already hold from before you registered it (see edge cases
below).

## Reading and writing

`Set` writes a value unconditionally, overwriting whatever was there. `Add` only writes if
the key has no value yet. For an already-populated ephemeral or persistent key it logs an
error and leaves the existing value alone, per its own doc comment ("use Set to overwrite").
For an already-populated **synced** key it silently does nothing instead of erroring, since
a synced key being pre-populated usually just means the network already delivered a value
before your own `Add` call ran. `Has`, `Get`, and the typed accessors (`GetString`, `GetInt`,
`GetFloat`, `GetBool`, `GetDict`, `GetList`) all read from whichever store the key's
registered tier maps to; an unregistered key reads from the ephemeral store, matching
where `Set`/`Add` would have written it.

`Add` on a synced key with no prior value writes into the local synced store immediately but
never calls `RequestSerialization`. The value doesn't reach other clients until some later
`Set` call on any synced key serializes the whole store. Use `Set`, not `Add`, for a synced
value that needs to go out right away.

`Remove` clears a key from its store but **keeps its registration**, so you can `Add` the
same key again later without re-registering it. `Clear` empties every store's values but
likewise preserves all registrations.

## The synced tier's mechanics

A `DataDictionary` isn't a type UdonSync can replicate directly, so the synced store is
serialized to a plain synced string (`_syncedJson`) via `TsJson` whenever `Set`, `Remove`, or
`Clear` changes a synced key (see the `Add` caveat above: that one path doesn't serialize),
and `RequestSerialization()` is called to send it. `TsvrcMemory` declares
`[UdonBehaviourSyncMode(BehaviourSyncMode.Manual)]`, meaning that request, not an automatic
per-frame sync, is what triggers a network send. On the receiving end, `OnDeserialization`
parses `_syncedJson` back into the synced store and emits `OnSyncedChangedEvent` to every
subscriber. Subscribe to it via [`TsSubscribe`](../core-concepts/tsvrc-behaviour#events-tssubscribe-and-tsemit)`(this,
TsvrcMemory.OnSyncedChangedEvent, nameof(YourCallback))`. That event fires only from
network-driven deserialization, never for your own local `Set` calls.

Writing to a synced key you don't currently own transfers ownership to the local player
first (`Networking.SetOwner`), matching VRChat's networking model where only the owner of an
object can push synced-variable updates for it.

If `_syncedJson` ever fails to parse as a JSON object, whether from malformed data or a JSON
array instead of a dictionary, `OnDeserialization` returns early without updating the store
or emitting the event, leaving the previous synced contents in place rather than clearing
them.

## PlayerData constraints (persistent tier)

These come from VRChat's own [persistence system](https://creators.vrchat.com/worlds/udon/persistence/player-data),
not from TsVRC:

- VRChat allows [100 KB of PlayerData per player per
  world](https://creators.vrchat.com/worlds/udon/persistence/#limitations). VRChat
  compresses data before storing it, so easily compressible data can exceed 100 KB
  uncompressed and still fit. Keep persistent values small regardless. Exceeding the limit
  fails the write silently: VRChat logs its own error, and no exception reaches your code.
- [VRChat cannot commit a PlayerData write made from inside
  `OnPlayerLeft`](https://creators.vrchat.com/worlds/udon/persistence/#limitations). Avoid
  calling `Set` on a persistent key there.
- [Persistent data is scoped to this
  world](https://creators.vrchat.com/worlds/udon/persistence/#limitations); it isn't shared
  with any other world.
- A persistent key can't actually be deleted from PlayerData: [VRChat's own API reference
  says the same](https://creators.vrchat.com/worlds/udon/persistence/player-data/#mutators)
  ("Keys cannot be deleted after being written."). `Remove` only clears the local
  in-memory cache, and logs a warning saying so.

Restoring persisted values happens in
[`OnPlayerRestored`](https://creators.vrchat.com/worlds/udon/persistence/player-data/#events),
which VRChat calls once the local player's saved data has been loaded (`IsPlayerRestored`
reflects whether that's happened yet). Restoration is type-directed: `TsvrcMemory` records
each persistent key's value type the first time you `Add` or `Set` it, and uses that
recorded type to read the right PlayerData accessor back (`GetString`, `GetInt`, and so
on). A key registered as persistent but never given a value before `OnPlayerRestored` runs
has no recorded type yet, so restoration logs a warning and skips it. Call `Add` or `Set`
on a persistent key before you expect it to be restored, not after.

## Usage

Register each key once, before you ever read or write it, commonly in `TsStart`:

```csharp
public class GameManager : TsBehaviour
{
    private const string DifficultyKey = "difficulty";
    private const string HighScoreKey = "highScore";

    protected override void TsStart()
    {
        _ts.Memory.Register(DifficultyKey, persist: false, synced: true);
        _ts.Memory.Register(HighScoreKey, persist: true, synced: false);

        _ts.Memory.Add(DifficultyKey, new DataToken(1));
        _ts.Memory.Add(HighScoreKey, new DataToken(0));

        _ts.Memory.TsSubscribe(this, TsvrcMemory.OnSyncedChangedEvent, nameof(_OnMemorySynced));
    }

    public void _OnMemorySynced()
    {
        int difficulty = _ts.Memory.GetInt(DifficultyKey);
    }

    public void IncreaseDifficulty()
    {
        _ts.Memory.Set(DifficultyKey, new DataToken(_ts.Memory.GetInt(DifficultyKey) + 1));
    }
}
```

`Add` seeds the default once without erroring on a value the network may have already
delivered. `Set` is what actually pushes a change, to `PlayerData` for the persistent key,
or to every client for the synced one; see "Reading and writing" above for exactly when
each method serializes.

## Edge cases worth knowing

- **Registering after data already exists doesn't migrate it.** If you `Set` a key while it's
  still unregistered (ephemeral), then `Register` it as persistent, the ephemeral value is
  orphaned in the ephemeral store; the persistent store still has nothing at that key.
  `Register` before your first `Add`/`Set`, per the class's own contract.
- **Registering the same key twice** logs an error and keeps the original tier; the second
  call's flags are discarded.
- **`Set` on a persistent key before `OnPlayerRestored`** still updates the local in-memory
  cache and the recorded value type (neither is rejected), but the PlayerData write itself
  is unconditionally skipped, with a warning logged, purely because `OnPlayerRestored`
  hasn't run yet for this instance, regardless of whether a type is already recorded for
  that key.
