---
id: built-world
title: BuiltWorld
sidebar_position: 11
---

# BuiltWorld

`Tsvrc.UdonTestKit.BuiltWorld` builds the world scene, the loaded scene that holds the scene
descriptor, into a world file with the VRChat SDK, reads what the file holds and deletes it, so a
test can check what a world build holds, such as which UdonSharp programs reach it.

```csharp
public class WorldBuildTests
{
    private BuiltWorld _world;

    [OneTimeSetUp]
    public void BuildTheWorld()
    {
        EditorSceneManager.OpenScene("Assets/Scenes/MyWorld.unity");
        _world = BuiltWorld.FromWorldScene();
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

- `BuiltWorld.FromWorldScene()` is static. It builds the world scene with the world exporter of the
  VRChat SDK, reads the world file and deletes it, and returns what it read. The world scene doesn't
  have to be the active scene, and unsaved changes to it are built as they are.
- `Text` is every object in the world file, as text. The `WebExtract` and `binary2text` tools that
  ship with the Unity Editor unpack the file and turn it into text.
- `HoldsProgramOf(Type udonSharpClass)` is true when the world holds the compiled program of that
  UdonSharp class. A program is in the world when the scene has a behaviour that runs it.

## What the build skips

`FromWorldScene` builds without the callbacks the VRChat SDK runs before a build, and one of them is
the UdonSharp compile for upload. The world holds each program as UdonSharp last compiled it for
the Editor. To check the compile for upload, use
[`UdonSharpUploadCompile`](./udon-sharp-upload-compile).

## Failure modes

The world exporter of the VRChat SDK builds only when the loaded scenes hold exactly one scene
descriptor, and only a world scene that was saved. It asks about the descriptors with a dialog, and
on Windows about a world scene never saved too, and outside batch mode a dialog waits for a click.
`FromWorldScene` checks both first and throws an `InvalidOperationException` instead, in every
mode:

- `The loaded scenes have 0 scene descriptors. The world exporter of the VRChat SDK builds a world with exactly one.`
  Every loaded scene counts, and so does an inactive descriptor, as they do for the exporter.
- `The world scene, which holds the scene descriptor, was never saved. The world exporter of the VRChat SDK builds only a saved scene.`

When the exporter reports that it built nothing, `FromWorldScene` throws an
`InvalidOperationException` with `The world exporter of the VRChat SDK didn't build the world scene.`

`HoldsProgramOf` throws the same errors as [`UdonHost.Create`](./udon-host#creating-behaviours) for
a class without a program asset, or in an assembly that player builds leave out.

## Edge cases

- The exporter records the path of the world file in `EditorPrefs`, which every Unity project of
  the same user shares. Each Unity process reads back the path its own build recorded, so two
  projects can build at the same time. `FromWorldScene` puts back the path recorded before the
  build.
- It reads the world in a new folder under the `Temp` folder of the project and deletes the folder
  afterwards, so a build in another project, or another test run, at the same time can't delete its
  files.
