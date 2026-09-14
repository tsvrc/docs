---
id: add-to-your-project
title: Add TsVRC to your project
sidebar_position: 1
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Add TsVRC to your project

Get TsVRC into a Unity project either through the VRChat Creator Companion (VCC) or by
importing a `.unitypackage` by hand. VCC is strongly recommended: it resolves the VRChat
Worlds SDK version TsVRC depends on for you, something a `.unitypackage` import leaves
you to sort out yourself.

## Requirements

- **Unity 2022.3.** TsVRC's package manifest targets this version specifically.
- **A Unity world project with the [VRChat Worlds
  SDK](https://creators.vrchat.com/worlds/) `3.10.x`.** VCC resolves this automatically
  when you install TsVRC; importing the `.unitypackage` needs it already in your project.

## Install the package

<Tabs>
<TabItem value="vcc" label="VRChat Creator Companion (recommended)" default>

If TsVRC's repository isn't in your Creator Companion yet, add it first (a one-time
step, the same as adding any other [community
repository](https://vcc.docs.vrchat.com/guides/community-repositories/)):

- **With VCC installed**, click [Add TsVRC to Creator
  Companion](vcc://vpm/addRepo?url=https%3A%2F%2Fvpm.tsvrc.com%2Findex.json)
  to open VCC directly to the add-repository prompt.
- **Or paste the listing URL manually**: open VCC, go to **Settings > Packages > Add
  Repository**, and paste:

  ```
  https://vpm.tsvrc.com/index.json
  ```

Once the repository's added:

1. Open the Creator Companion, select your project, and click **Manage Project**.
2. Find **TsVRC** (`com.tsvrc.core`) in the package list and press the **+** next to it
   to install it.
3. Wait for Unity to finish importing and recompiling.

</TabItem>
<TabItem value="unitypackage" label=".unitypackage">

1. Download the latest `.unitypackage` from [TsVRC's GitHub
   Releases](https://github.com/tsvrc/tsvrc-core/releases).
2. With your project open, double-click the downloaded file (or use **Assets > Import
   Package > Custom Package**) and import everything.
3. Wait for Unity to finish importing and recompiling.

Nothing here resolves the VRChat Worlds SDK version for you, so confirm it's already at
`3.10.x` before importing. If your project also uses VCC for other packages, prefer the
VCC tab instead: mixing a hand-imported package with VCC-managed ones makes future
updates and dependency resolution your own responsibility to track.

</TabItem>
</Tabs>

You'll know it worked when Unity's menu bar gains a **Tsvrc** menu. Everything TsVRC does
from here runs from there.

## What you just added

TsVRC's manifest description sums it up: structured initialization, dependency wiring,
and editor codegen tooling for building VRChat worlds with UdonSharp. Concretely, the
package compiles as one runtime assembly (`Tsvrc.Runtime`), the base classes your world's
scripts extend and call into, and one editor-only assembly (`Tsvrc.Editor`) holding all
the codegen and Configure-window tooling. See [How TsVRC fits
together](./core-concepts/how-it-fits-together) for how those two halves relate.

Three further assemblies, `Tsvrc.Testing.Framework`, `Tsvrc.Testing.Behaviours`, and
`Tsvrc.Testing.UI`, exist purely to support testing a *consumer's* own project, kept
separate from each other and from `Tsvrc.Runtime`/`Tsvrc.Editor` for the reasons covered
in [Testing your world](./testing/testing-your-world).

## Next

Continue to [Build your first behaviour](./first-behaviour) to initialize TsVRC in a
scene and get a script running.
