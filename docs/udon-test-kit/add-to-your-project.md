---
id: add-to-your-project
title: Add Udon Test Kit to your project
sidebar_position: 2
---

# Add Udon Test Kit to your project

Install the kit in a VRChat world project, then create the test assemblies your tests go in.

## Requirements

- **Unity 2022.3**, on Windows, or on Linux with the Windows build target, in the Editor and in
  batch mode.
- **The [VRChat Worlds SDK](https://creators.vrchat.com/worlds/) 3.8.2 or a later 3.x version**,
  which includes UdonSharp and ClientSim.
- **Unity Test Framework**, which new Unity projects already include.

## Install the package

Install **Udon Test Kit** (`com.tsvrc.udon-test-kit`) as described in
[Install a TsVRC package](/docs/install-a-package). Its `.unitypackage` is on the
[releases page](https://github.com/tsvrc/udon-test-kit/releases).

You'll know it worked when the Unity menu bar has **Tools > TsVRC > Udon Test Kit**.

## Create your test assemblies

Unity Test Framework finds tests in test assemblies, and the kit creates the ones a world needs.

1. In the Project window, select the folder your tests should live in, such as `Assets`.
2. Choose **Assets > Create > TsVRC > Udon Test Kit > Test Assemblies**.

You get a `Tests` folder with four assemblies, each with an example that works:

- `EditMode` and `PlayMode` hold your tests.
- `Doubles` holds behaviours your tests add to GameObjects, such as spies with callbacks of your
  own.
- `UdonDoubles` holds test doubles that run as Udon.

Both test assemblies reference both doubles assemblies. All four reference UdonSharp, the VRChat
SDK and the assembly definitions of your world, and the kit or, for `UdonDoubles`, its Udon spy.
Only `UdonDoubles` compiles into player builds, as UdonSharp needs to compile its doubles for
upload, and a world holds a double only when one of its scenes has it.
[TestAssemblyCreator](./reference/test-assembly-creator) describes each one.

If your scripts have no assembly definition, the menu item logs a warning, and Play Mode tests
can't reach them yet. See
[Test scripts that have no assembly definition](./how-to/testing-scripts-without-an-assembly-definition).

## Next

Continue to [Write your first test](./first-test) to run the examples and write a test of your own.
