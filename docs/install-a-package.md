---
id: install-a-package
title: Install a TsVRC package
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Install a TsVRC package

Every TsVRC package installs the same way. A project's own install page says which package to add,
what it needs, and how to check that it worked.

<Tabs>
<TabItem value="vcc" label="VRChat Creator Companion (recommended)" default>

1. Add the TsVRC repository to the Creator Companion, once per computer: click
   [Add to VCC](vcc://vpm/addRepo?url=https%3A%2F%2Fvpm.tsvrc.com%2Findex.json), or add
   `https://vpm.tsvrc.com/index.json` as described in VRChat's
   [Community Repositories](https://vcc.docs.vrchat.com/guides/community-repositories/) guide.
2. Click **Manage Project** next to your project, then **+** next to the package.

The Creator Companion adds the package to your project's `Packages` folder, along with the packages
it depends on, and resolves the VRChat Worlds SDK version it needs.

</TabItem>
<TabItem value="unitypackage" label=".unitypackage">

1. Download the package's latest `.unitypackage` from the GitHub releases page its install page
   links to.
2. With your project open, double-click the file, or use **Assets > Import Package > Custom
   Package**, and import everything.

The package goes in your project's `Assets` folder. A `.unitypackage` can't install the packages it
depends on or check your VRChat Worlds SDK version, so import those and check the version yourself.
In a project that uses the Creator Companion for other packages, use it for this one too: updates
and dependencies of a hand-imported package are yours to track.

</TabItem>
</Tabs>
