---
id: add-to-your-project
title: Add TsVRC Core to your project
sidebar_position: 1
---

# Add TsVRC Core to your project

Install TsVRC Core in a VRChat world project.

## Requirements

- **Unity 2022.3.** Core's package manifest targets this version specifically.
- **The [VRChat Worlds SDK](https://creators.vrchat.com/worlds/) `3.10.x`.**

## Install the package

Install **TsVRC Core** (`com.tsvrc.core`) as described in
[Install a TsVRC package](/docs/install-a-package). Its `.unitypackage` is on
[Core's GitHub releases](https://github.com/tsvrc/tsvrc-core/releases).

Core depends on [Udon Test Kit](/docs/udon-test-kit/intro) (`com.tsvrc.udon-test-kit`) for its
testing helpers. The Creator Companion installs it along with Core. With the `.unitypackage`,
import [the kit's](/docs/udon-test-kit/add-to-your-project) too, unless your project already has
it.

You'll know it worked when Unity's menu bar gains a **Tsvrc** menu. Everything Core does
from here runs from there.

## What you just added

Core's manifest description sums it up: structured initialization, dependency wiring,
and editor codegen tooling for building VRChat worlds with UdonSharp. Concretely, the
package compiles as one runtime assembly (`Tsvrc.Runtime`), the base classes your world's
scripts extend and call into, and one editor-only assembly (`Tsvrc.Editor`) holding all
the codegen and Configure-window tooling. See [How Core fits
together](./core-concepts/how-it-fits-together) for how those two halves relate.

## Next

Continue to [Build your first behaviour](./first-behaviour) to initialize Core in a
scene and get a script running.
