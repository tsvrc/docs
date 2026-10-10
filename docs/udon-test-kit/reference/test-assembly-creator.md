---
id: test-assembly-creator
title: TestAssemblyCreator
sidebar_position: 8
---

# TestAssemblyCreator

`UdonTestKit.TestAssemblyCreator` creates the test assemblies a world needs: an Edit Mode test
assembly, a Play Mode test assembly, and a test doubles assembly both of them reference. Run it from
**Assets > Create > Udon Test Kit > Test Assemblies**, or from the Project window's right-click
**Create** menu.

## Where it creates them

It creates a `Tests` folder inside the folder selected in the Project window, or inside the folder
of a selected file. When nothing under `Assets` is selected, it uses `Assets`. An existing `Tests`
folder is left alone, and the new one is named `Tests 1`, `Tests 2` and so on.

## What it creates

The assembly names start with your project's **Product Name** from Player Settings, without spaces
or symbols. A name that ends up empty, or starts with a digit, becomes `World`. For a product named
"My World":

| Folder | Assembly | Platforms | Example |
| --- | --- | --- | --- |
| `Tests/EditMode` | `MyWorld.Tests.EditMode` | Editor | `ExampleEditModeTests.cs` |
| `Tests/PlayMode` | `MyWorld.Tests.PlayMode` | every platform | `ExamplePlayModeTests.cs` |
| `Tests/Doubles` | `MyWorld.Tests.Doubles` | every platform | `ExampleSpy.cs` |

When assemblies with those names already exist, the new ones get a number, such as
`MyWorld2.Tests.EditMode`. Two assemblies with the same name stop a project compiling.

Each assembly references the kit, UdonSharp, the VRChat SDK, ClientSim, and every assembly
definition of yours with scripts under `Assets`, other than test assemblies. The two test assemblies
also reference the doubles assembly and Unity Test Framework. All three compile only when Unity
Test Framework includes tests, so none of them reaches a world build, and none is referenced
automatically by other assemblies.

The `Doubles` assembly is for behaviours your tests add to GameObjects, such as
[`CallbackSpy`](./callback-spy-and-call-log) subclasses. It has no NUnit reference. Unity won't add
a behaviour from the Editor-only Edit Mode assembly to a GameObject, and Unity requires Edit Mode
and Play Mode tests to be in separate assemblies, so behaviours both kinds of test use go here.

Each example compiles and passes as created.

## Edge cases

- The list of your assemblies is read once, when you create the test assemblies. Add an assembly
  definition later, and add it to the test assemblies' references yourself.
- Scripts without an assembly definition compile into `Assembly-CSharp`, which an assembly
  definition can't reference. When any script under `Assets` has none, creating the assemblies logs
  a warning. See
  [Test scripts that have no assembly definition](../how-to/testing-scripts-without-an-assembly-definition).
- `TestAssemblyCreator.Create(string parentFolder = "Assets")` does the same from code, and returns
  the new folder's path. `TestAssemblyCreator.MenuPath` is the menu item's path.
