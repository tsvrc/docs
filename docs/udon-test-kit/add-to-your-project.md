---
id: add-to-your-project
title: Add Udon Test Kit to your project
sidebar_position: 2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Add Udon Test Kit to your project

Install the kit in a VRChat world project, then create the test assemblies your tests go in. The
VRChat Creator Companion (VCC) is the recommended way to install it, because it also resolves the
VRChat Worlds SDK version the kit needs.

## Requirements

- **Unity 2022.3.**
- **The [VRChat Worlds SDK](https://creators.vrchat.com/worlds/) 3.8.2 or later**, which includes
  UdonSharp and ClientSim.
- **Unity Test Framework**, which new Unity projects already include.

## Install the package

<Tabs>
<TabItem value="vcc" label="VRChat Creator Companion (recommended)" default>

If the `vpm.tsvrc.com` repository isn't in your Creator Companion yet, add it first. It's a
one-time step, the same as adding any other
[community repository](https://vcc.docs.vrchat.com/guides/community-repositories/):

- **With VCC installed**, click
  [Add the repository to Creator Companion](vcc://vpm/addRepo?url=https%3A%2F%2Fvpm.tsvrc.com%2Findex.json)
  to open VCC at the add-repository prompt.
- **Or paste the listing URL yourself**: open VCC, go to **Settings > Packages > Add Repository**,
  and paste:

  ```
  https://vpm.tsvrc.com/index.json
  ```

Once the repository is added:

1. Open the Creator Companion, select your project, and click **Manage Project**.
2. Find **Udon Test Kit** (`com.tsvrc.udon-test-kit`) in the package list and press the **+** next
   to it.
3. Wait for Unity to finish importing and recompiling.

The Creator Companion installs the kit in your project's `Packages` folder.

</TabItem>
<TabItem value="unitypackage" label=".unitypackage">

1. Download the latest `.unitypackage` from the kit's
   [GitHub releases](https://github.com/tsvrc/udon-test-kit/releases).
2. With your project open, double-click the downloaded file, or use **Assets > Import Package >
   Custom Package**, and import everything.
3. Wait for Unity to finish importing and recompiling.

The kit goes in your project's `Assets` folder and works the same from there. Nothing here checks
the VRChat Worlds SDK version for you, so confirm it's 3.8.2 or later first. A `.unitypackage` can't
carry the command-line script; see
[Run tests from the command line](./how-to/running-tests-from-the-command-line) for where to get it.

</TabItem>
</Tabs>

You'll know it worked when Unity's **Tools** menu has an **Udon Test Kit** entry.

:::warning
A project can hold only one copy of the kit. Two copies mean two assemblies named `UdonTestKit`,
which stop the whole project compiling. Don't import the `.unitypackage` into a project that
already has the kit in `Packages`, including a copy another package installed as its dependency.
:::

## Create your test assemblies

Unity Test Framework finds tests in test assemblies, and the kit creates the three a world needs.

1. In the Project window, select the folder your tests should live in, such as `Assets`.
2. Choose **Assets > Create > Udon Test Kit > Test Assemblies**.
3. Wait for Unity to compile.

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
