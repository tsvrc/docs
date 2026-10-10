---
id: add-to-your-project
title: Add Udon Test Kit to your project
sidebar_position: 2
---

# Add Udon Test Kit to your project

Install the kit in a VRChat world project, then create the test assemblies your tests go in.

## Requirements

- **Unity 2022.3.**
- **The [VRChat Worlds SDK](https://creators.vrchat.com/worlds/) 3.8.2 or later**, which includes
  UdonSharp and ClientSim.
- **Unity Test Framework**, which new Unity projects already include.

## Install the package

Install **Udon Test Kit** (`com.tsvrc.udon-test-kit`) as described in
[Install a TsVRC package](/docs/install-a-package). Its `.unitypackage` is on the kit's
[GitHub releases](https://github.com/tsvrc/udon-test-kit/releases).

You'll know it worked when Unity's menu bar has **Tools > TsVRC > Udon Test Kit**.

:::warning
A project can hold only one copy of the kit. Two copies mean two assemblies named `Tsvrc.UdonTestKit`,
which stop the whole project compiling. Don't import the `.unitypackage` into a project that
already has the kit in `Packages`, including a copy another package installed as its dependency.
:::

## Create your test assemblies

Unity Test Framework finds tests in test assemblies, and the kit creates the three a world needs.

1. In the Project window, select the folder your tests should live in, such as `Assets`.
2. Choose **Assets > Create > TsVRC > Udon Test Kit > Test Assemblies**.

You get a `Tests` folder with three assemblies, each with an example that works:

- `EditMode` and `PlayMode` hold your tests.
- `Doubles` holds behaviours your tests add to GameObjects, such as spies with callbacks of your
  own. Both test assemblies reference it.

They reference the kit, UdonSharp, the VRChat SDK, ClientSim and every assembly definition of yours
under `Assets`, and like the kit, they're left out of your world's builds.
[TestAssemblyCreator](./reference/test-assembly-creator) describes each one.

If your scripts have no assembly definition, the menu item logs a warning, and Play Mode tests
can't reach them yet. See
[Test scripts that have no assembly definition](./how-to/testing-scripts-without-an-assembly-definition).

## Next

Continue to [Write your first test](./first-test) to run the examples and write a test of your own.
