---
id: built-world
title: BuiltWorld
sidebar_position: 11
---

# BuiltWorld

`Tsvrc.UdonTestKit.BuiltWorld` builds the open scene into a world file with the VRChat SDK, reads
what the file holds and deletes it, so a test can check what a world build holds, such as which
UdonSharp programs reach it.

```csharp
public class WorldBuildTests
{
    private BuiltWorld _world;

    [OneTimeSetUp]
    public void BuildTheWorld()
    {
        EditorSceneManager.OpenScene("Assets/Scenes/MyWorld.unity");
        _world = BuiltWorld.FromOpenScene();
    }

    [Test]
    public void HoldsProgramOf_Scoreboard_IsTrue()
    {
        Assert.That(_world.HoldsProgramOf(typeof(Scoreboard)), Is.True);
    }
}
```

Use it in an Edit Mode test. A build takes a while, so build once per fixture, in
`[OneTimeSetUp]`, and check the result in each test.
[Check which programs your world build holds](../how-to/checking-what-a-world-build-holds) walks
through it.

## Members

- `BuiltWorld.FromOpenScene()` is static. It builds the open scene with the world exporter of the
  VRChat SDK, reads the world file and deletes it, and returns what it read.
- `Text` is every object in the world file, as text. The `WebExtract` and `binary2text` tools that
  ship with the Unity Editor unpack the file and turn it into text.
- `HoldsProgramOf(Type udonSharpClass)` is true when the world holds the compiled program of that
  UdonSharp class. A program is in the world when the scene has a behaviour that runs it.

## What the build skips

`FromOpenScene` builds without the callbacks the VRChat SDK runs before a build, and one of them is
the UdonSharp compile for upload. The world holds each program as UdonSharp last compiled it for
the Editor. To check the compile for upload, use
[`UdonSharpUploadCompile`](./udon-sharp-upload-compile).

## Failure modes

- The world exporter of the VRChat SDK builds only a saved scene with exactly one scene
  descriptor. It asks about the descriptors with a dialog, and on Windows about a scene never
  saved too, and outside batch mode a dialog waits for a click. `FromOpenScene` checks both first
  and throws an `InvalidOperationException` instead, in every mode:
  - `The open scene has 0 scene descriptors. The world exporter of the VRChat SDK builds a scene with exactly one.`
    An inactive descriptor counts, as it does for the exporter.
  - `The open scene was never saved. The world exporter of the VRChat SDK builds only a saved scene.`
    Unsaved changes to a saved scene don't matter: the exporter builds it as it is.
- `HoldsProgramOf` throws the same errors as [`UdonHost.Create`](./udon-host#creating-behaviours)
  for a class without a program asset, or in an assembly that player builds leave out.

## Edge cases

- The exporter records the path of the world file in `EditorPrefs`, which every Unity project of
  the same user shares. `FromOpenScene` puts back the path recorded before the build.
- It reads the world in a new folder under the `Temp` folder of the project and deletes the folder
  afterwards, so a build in another project, or another test run, at the same time can't delete its
  files.
