---
id: persisting-a-value
title: Persist a value across visits
sidebar_position: 6
---

# Persist a value across visits

How to save a value for the local player that's still there the next time they load your
world, using [`TsvrcMemory`](../networking-data/tsvrc-memory)'s persistent tier. No
registration or pooling is needed to reach it at all: it's always available as `_ts.Memory`.

## Steps

1. Pick a key and register it as persistent, once, before you ever read or write it:

   ```csharp
   public class AudioSettings : TsBehaviour
   {
       private const string VolumeKey = "musicVolume";

       protected override void TsStart()
       {
           _ts.Memory.Register(VolumeKey, persist: true, synced: false);
           _ts.Memory.Add(VolumeKey, new DataToken(1f));
       }
   }
   ```

   `Add` seeds a default without overwriting a value VRChat may have already restored by
   the time `TsStart` runs.

2. Read and write it like any other value:

   ```csharp
   public float GetVolume() => _ts.Memory.GetFloat(VolumeKey);

   public void SetVolume(float value) => _ts.Memory.Set(VolumeKey, new DataToken(value));
   ```

3. If your UI needs to reflect the restored value the moment it becomes available, react to
   [`OnPlayerRestored`](https://creators.vrchat.com/worlds/udon/persistence/player-data/#events)
   rather than assuming `TsStart` already has it: VRChat restores `PlayerData`
   asynchronously, and `TsvrcMemory` only has a real value to read once that fires.

   ```csharp
   [SerializeField] private Slider _volumeSlider; // add this field to AudioSettings too

   public override void OnPlayerRestored(VRCPlayerApi player)
   {
       if (!player.isLocal) return;
       _volumeSlider.value = _ts.Memory.GetFloat(VolumeKey);
   }
   ```

Call `Add` or `Set` on the key before this point too (step 1 already does), since
`TsvrcMemory` only knows which typed accessor to restore with once a value has been
written at least once.

## Letting a feature own its own keys

A key doesn't have to be registered from your world root. Give each feature module a
static method that registers and seeds its own keys, and call it once from wherever your
world already does one-time setup:

```csharp
public static class DifficultySettings
{
    public const string DifficultyKey = "difficulty";

    public static void Register(TsvrcMemory memory)
    {
        memory.Register(DifficultyKey, persist: true, synced: false);
        memory.Add(DifficultyKey, new DataToken(1));
    }
}
```

```csharp
protected override void TsStart()
{
    DifficultySettings.Register(_ts.Memory);
    // ...one line per feature module that owns its own persisted keys.
}
```

This keeps a feature's own persisted keys next to the feature that owns them instead of
piling every key into one root class as the world grows.

## Why this shape

See [`TsvrcMemory`'s reference page](../networking-data/tsvrc-memory) for the full
contract: the three isolated tiers (ephemeral/persistent/synced), why `Add` and `Set`
behave differently, VRChat's own PlayerData size and timing limits, and what happens if
you register the same key twice or write to it before it's restored.
