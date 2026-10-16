---
id: checking-what-a-world-build-holds
title: Check which programs your world build holds
sidebar_position: 11
---

# Check which programs your world build holds

A world build holds the program of a behaviour only when the scene has that behaviour. To check
that a behaviour your world needs reaches the build, or that one meant only for the Editor stays
out, build the scene in an Edit Mode test with [`BuiltWorld`](../reference/built-world).

## Steps

1. In your `Tests/EditMode` folder, create a test class that opens your world scene and builds it
   once for all its tests:

   ```csharp
   using NUnit.Framework;
   using Tsvrc.UdonTestKit;
   using UnityEditor.SceneManagement;

   public class WorldBuildTests
   {
       private BuiltWorld _world;

       [OneTimeSetUp]
       public void BuildTheWorld()
       {
           EditorSceneManager.OpenScene("Assets/Scenes/MyWorld.unity");
           _world = BuiltWorld.FromOpenScene();
       }
   }
   ```

2. Add a test for each behaviour to check:

   ```csharp
   [Test]
   public void HoldsProgramOf_Scoreboard_IsTrue()
   {
       Assert.That(_world.HoldsProgramOf(typeof(Scoreboard)), Is.True);
   }

   [Test]
   public void HoldsProgramOf_DebugMenu_IsFalse()
   {
       Assert.That(_world.HoldsProgramOf(typeof(DebugMenu)), Is.False);
   }
   ```

3. Run them from the **EditMode** tab of the Test Runner.

## What to watch for

The build holds each program as UdonSharp last compiled it for the Editor, because it skips the
compile for upload. To check that compile too, see
[Check that your world compiles for upload](./checking-your-world-compiles-for-upload).

The scene has to be saved and have exactly one scene descriptor, or the VRChat SDK builds nothing.
`FromOpenScene` checks both first and throws an error that says which.
