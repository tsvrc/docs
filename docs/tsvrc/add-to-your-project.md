---
id: add-to-your-project
title: Add TsVRC to your project
sidebar_position: 1
---

# Add TsVRC to your project

Install TsVRC in a VRChat world project.

## Requirements

- **Unity 2022.3.** TsVRC's package manifest targets this version specifically.
- **The [VRChat Worlds SDK](https://creators.vrchat.com/worlds/) `3.10.x`.**

## Install the package

Install **TsVRC** (`com.tsvrc.core`) as described in
[Install a TsVRC package](/docs/install-a-package). Its `.unitypackage` is on
[TsVRC's GitHub releases](https://github.com/tsvrc/tsvrc-core/releases).

TsVRC depends on [Udon Test Kit](/docs/udon-test-kit/intro) (`com.tsvrc.udon-test-kit`) for its
testing helpers. The Creator Companion installs it along with TsVRC. With the `.unitypackage`,
import [the kit's](/docs/udon-test-kit/add-to-your-project) too, unless your project already has
it.

You'll know it worked when Unity's menu bar gains a **Tsvrc** menu. Everything TsVRC does
from here runs from there.

## What you just added

TsVRC's manifest description sums it up: structured initialization, dependency wiring,
and editor codegen tooling for building VRChat worlds with UdonSharp. Concretely, the
package compiles as one runtime assembly (`Tsvrc.Runtime`), the base classes your world's
scripts extend and call into, and one editor-only assembly (`Tsvrc.Editor`) holding all
the codegen and Configure-window tooling. See [How TsVRC fits
together](./core-concepts/how-it-fits-together) for how those two halves relate.

Two further assemblies, `Tsvrc.Testing.Framework` and `Tsvrc.Testing.UI`, exist purely to
support testing a *consumer's* own project, kept separate from each other and from
`Tsvrc.Runtime`/`Tsvrc.Editor` for the reasons covered in [Testing your
world](./testing/testing-your-world).

## Next

Continue to [Build your first behaviour](./first-behaviour) to initialize TsVRC in a
scene and get a script running.
