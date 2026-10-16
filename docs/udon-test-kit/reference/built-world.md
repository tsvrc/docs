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

- The open scene has to be one the VRChat SDK can build, with a scene descriptor. In batch mode,
  building a scene without one throws an `InvalidOperationException`:
  `The world exporter of the VRChat SDK didn't build the open scene.` Outside batch mode, the
  exporter shows a dialog instead and waits for a click.
- `HoldsProgramOf` throws the same errors as [`UdonHost.Create`](./udon-host#creating-behaviours)
  for a class without a program asset, or in an assembly that player builds leave out.

## Edge cases

- The exporter records the path of the world file in `EditorPrefs`, which every Unity project of
  the same user shares. `FromOpenScene` puts back the path recorded before the build.
- It reads the world in a new folder under the `Temp` folder of the project and deletes the folder
  afterwards, so a build in another project, or another test run, at the same time can't delete its
  files.
