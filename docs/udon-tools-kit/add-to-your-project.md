---
id: add-to-your-project
title: Add Udon Tools Kit to your project
sidebar_position: 2
---

# Add Udon Tools Kit to your project

## Requirements

- **Unity 2022.3**.
- **The [VRChat Worlds SDK](https://creators.vrchat.com/worlds/) 3.10.5 or a later 3.x version**,
  which includes UdonSharp.

## Install the package

Install **Udon Tools Kit** (`com.tsvrc.udon-tools-kit`) as described in
[Install a TsVRC package](/docs/install-a-package). Its `.unitypackage` is on the
[releases page](https://github.com/tsvrc/udon-tools-kit/releases).

You'll know it worked when your UdonSharp scripts can use `Tsvrc.UdonToolsKit.Events.EventEmitter`.
Scripts without an assembly definition reach the kit on their own. A script in an
[assembly definition](https://docs.unity3d.com/2022.3/Documentation/Manual/class-AssemblyDefinitionImporter.html)
of your world needs a reference to `Tsvrc.UdonToolsKit.Events` in it.

## Next

Continue to [Send events between behaviours](./how-to/sending-events-between-behaviours).
