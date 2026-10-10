---
id: test-scene
title: TestScene
sidebar_position: 3
---

# TestScene

`Tsvrc.UdonTestKit.TestScene` is a scene for Play Mode tests to run in: a new empty scene, or a scene
asset such as your world's own. Loading it makes it the active scene, so ClientSim and the objects
a test creates go into it, and unloading it destroys them.

[`ClientSimTestBase`](./clientsim-test-base) loads and unloads one for you when you pass it to the
base constructor, as in [Run tests in a scene of their own](../how-to/running-tests-in-their-own-scene).
You can also use it on its own.

## Creating one

- `TestScene.Empty(string name)` is a new empty scene with that name. It's created each time it's
  loaded, so every load starts empty.
- `TestScene.FromAsset(string assetPath)` is the scene asset at that path, such as
  `"Assets/Scenes/MyWorld.unity"`. It doesn't need to be in the build settings.

Neither one loads anything until `Load` runs.

## Members

`Load()` is a coroutine: `yield return scene.Load()`. It loads the scene alongside the scenes
already loaded, so Unity Test Framework's own test scene stays loaded, and makes it the active
scene. It does nothing when the scene is already loaded.

`Unload()` makes the scene that was active before `Load` active again, then unloads this scene and
everything in it. It finishes before it returns, so it also works where a test can't wait, such as
in `[OneTimeTearDown]`. It does nothing when the scene isn't loaded.

`IsLoaded` is true between a `Load` that finished and the next `Unload`.

## Using it without the base class

Load it in a `[UnitySetUp]` and unload it once ClientSim has ended, such as in a
`[UnityTearDown]`:

```csharp
private readonly TestScene _scene = TestScene.Empty("Inventory");
private readonly ClientSimSession _session = new ClientSimSession();

[UnitySetUp]
public IEnumerator SetUp()
{
    yield return _scene.Load();
}

[UnityTearDown]
public IEnumerator TearDown()
{
    _session.End();
    _scene.Unload();
    yield break;
}
```

End the session before unloading the scene, the same order `ClientSimTestBase` uses.

## Edge cases

- `TestScene` works only in Play Mode tests. `FromAsset` loads through
  `EditorSceneManager.LoadSceneInPlayMode`, which is why the scene doesn't need to be in the build
  settings.
- Unity drops the operation `LoadSceneInPlayMode` loads with. When the garbage collector finalized
  it as Unity exited, Unity crashed after every test had passed, so `Load` finalizes it right after
  the scene loads, while that's still safe.
- `Unload` uses Unity's synchronous `SceneManager.UnloadScene`, which Unity marks obsolete because
  it's unsafe inside physics callbacks. A test's setup and teardown aren't physics callbacks.

## TestSceneLifetime

`Tsvrc.UdonTestKit.TestSceneLifetime` tells `ClientSimTestBase` how long its scene lives:

- `PerTest`, the default, loads a fresh copy for every test and unloads it after. Each test starts
  from the same scene, and whatever a test created is gone before the next one.
- `PerFixture` loads it for the first test in the class and unloads it after the last. The tests
  share whatever the earlier ones changed in it.
