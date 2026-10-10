---
id: running-tests-in-their-own-scene
title: Run tests in a scene of their own
sidebar_position: 1
---

# Run tests in a scene of their own

By default, every Play Mode test runs in Unity Test Framework's own test scene, which the whole run
shares, so whatever one test leaves behind is still there in the next. Give a test class a scene of
its own by passing a [`TestScene`](../reference/test-scene) to `ClientSimTestBase`.

## An empty scene for every test

```csharp
public class InventoryTests : ClientSimTestBase
{
    public InventoryTests() : base(TestScene.Empty("Inventory"))
    {
    }
}
```

Before your own setup runs, every test gets a new empty scene, which becomes the active scene.
ClientSim and the objects your test creates go into it, and it's unloaded after the test,
destroying all of them.

## Your world's own scene

```csharp
public class LobbyTests : ClientSimTestBase
{
    public LobbyTests() : base(TestScene.FromAsset("Assets/Scenes/MyWorld.unity"), TestSceneLifetime.PerFixture)
    {
    }
}
```

The scene doesn't need to be in the build settings. When it has a scene descriptor, the session
uses it, and the local player spawns at its spawn point.

Choose the lifetime by what your tests do to the scene:

- `TestSceneLifetime.PerTest`, the default, loads the scene again for every test, so each test
  starts from the scene as saved.
- `TestSceneLifetime.PerFixture` loads it once for the whole class. A large scene loads faster
  that way, but every test sees what the earlier ones changed, so keep it for tests that only read.

ClientSim keeps saved data per scene name, so tests in your world's scene read and write the same
saved data you get when you press Play. To start a test from none, see
[Check that saved data survives a rejoin](./testing-saved-data).
