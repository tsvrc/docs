---
id: test-assembly-creator
title: TestAssemblyCreator
sidebar_position: 13
---

# TestAssemblyCreator

`Tsvrc.UdonTestKit.TestAssemblyCreator` creates the test assemblies a world needs: an Edit Mode test
assembly, a Play Mode test assembly, and two test doubles assemblies both of them reference, one for
behaviours the tests add to GameObjects and one for test doubles that run as Udon. Run it from
**Assets > Create > TsVRC > Udon Test Kit > Test Assemblies**, or from the right-click **Create**
menu of the Project window.

## Where it creates them

It creates a `Tests` folder inside the folder selected in the Project window, or inside the folder
of a selected file. When nothing under `Assets` is selected, it uses `Assets`. An existing `Tests`
folder is left alone, and the new one is named `Tests 1`, `Tests 2` and so on.

## What it creates

The assembly names start with the **Product Name** of your project from Player Settings, without
spaces or symbols. A name that ends up empty, or starts with a digit, becomes `World`. For a
product named "My World":

| Folder | Assembly | Platforms | Example |
| --- | --- | --- | --- |
| `Tests/EditMode` | `MyWorld.Tests.EditMode` | Editor | `ExampleEditModeTests.cs` |
| `Tests/PlayMode` | `MyWorld.Tests.PlayMode` | every platform | `ExamplePlayModeTests.cs` |
| `Tests/Doubles` | `MyWorld.Tests.Doubles` | every platform | `ExampleSpy.cs` |
| `Tests/UdonDoubles` | `MyWorld.Tests.UdonDoubles` | every platform | `ExampleUdonDouble.cs` |

When assemblies with those names already exist, the new ones get a number, such as
`MyWorld2.Tests.EditMode`. Two assemblies with the same name stop a project compiling.

The examples go in the namespace `MyWorld.Tests`. UdonSharp compiles every U# script of a project
together, so two U# classes with the same namespace and name fail the compile of every program,
and the namespace keeps the example Udon double of each set of test assemblies apart.

Each example compiles and passes as created. `ExamplePlayModeTests` extends
[`UdonTestBase`](./udon-test-base): one test spawns a remote player in ClientSim, and the other runs
`ExampleUdonDouble` as Udon and reads the call it logged.

## What they reference

The test assemblies and `Doubles` reference both kit assemblies, `Tsvrc.UdonTestKit` and
`Tsvrc.UdonTestKit.UdonSpies`, along with UdonSharp, the VRChat SDK with Udon, ClientSim, and every
assembly definition of yours with scripts under `Assets` that player builds include, other than
test assemblies. The Edit Mode test assembly also references your Editor-only assembly definitions,
such as those of your Editor tooling. The two test assemblies also reference both doubles
assemblies and Unity Test Framework. An assembly counts as a test assembly when its assembly
definition lists NUnit among its precompiled references.

`UdonDoubles` references `Tsvrc.UdonTestKit.UdonSpies`, UdonSharp, the VRChat SDK with Udon, and
your assembly definitions that player builds include: only assemblies that player builds include
themselves.

None of the four is referenced automatically by other assemblies.

## The doubles assemblies

`Doubles` is for behaviours your tests add to GameObjects, such as
[`CallbackSpy`](./callback-spy-and-call-log) subclasses. It has no NUnit reference. Unity won't add
a behaviour from the Editor-only Edit Mode assembly to a GameObject, and Unity requires Edit Mode
and Play Mode tests to be in separate assemblies, so behaviours both kinds of test use go here.

`UdonDoubles` is for test doubles that run as Udon, through [`UdonHost`](./udon-host). UdonSharp
compiles only player assemblies for a world upload, so `UdonHost` refuses a double in an assembly
that player builds leave out, such as `Doubles`. `UdonDoubles` has a U# assembly definition, and
the example double has its program asset. Create a double in that folder with
**Assets > Create > U# Script**, which creates its program asset too, as in
[Check the calls Udon code makes](../how-to/checking-calls-made-from-udon).

## A world build

The test assemblies and `Doubles` compile only when Unity Test Framework includes tests, so none of
them reaches a world build. `UdonDoubles` has no define constraint and compiles into player builds,
as the compile for upload needs, but a world holds the program of a double only when one of its
scenes has that double.

## Edge cases

- The list of your assemblies is read when you create the test assemblies. After you add an
  assembly definition, run
  [**Tools > TsVRC > Udon Test Kit > Update Test Assembly References**](./test-assembly-updater).
- Scripts without an assembly definition compile into `Assembly-CSharp`, or into
  `Assembly-CSharp-firstpass` from a top-level `Plugins` or `Standard Assets` folder, and an
  assembly definition can't use those. When any script under `Assets` has none, creating the
  assemblies logs a warning. The utility scripts UdonSharp copies into `Assets/UdonSharp` don't
  count, since they aren't yours. See
  [Test scripts that have no assembly definition](../how-to/testing-scripts-without-an-assembly-definition).
- `TestAssemblyCreator.Create(string parentFolder = "Assets")` does the same from code, and returns
  the path of the new folder. It takes `Assets` or a folder under it, and throws an
  `ArgumentException` for any other path, since it imports what it writes and creates assets next
  to it. `TestAssemblyCreator.MenuPath` is the path of the menu item.
