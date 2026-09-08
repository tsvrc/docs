---
id: package
title: Package and requirements
sidebar_position: 4
---

# Package and requirements

TsVRC ships as a single VPM/UPM package, `com.tsvrc.core`, meant to be added through the
VRChat Creator Companion rather than copied into a project by hand.

## Why add it through VCC

The package manifest declares a dependency on `com.vrchat.worlds` (the VRChat Worlds SDK),
pinned to a `3.5.x` range. VCC resolves that dependency and whatever SDK version your
project already has for you; adding the package's files directly (for example by cloning
into `Packages/`) skips that resolution and leaves you responsible for having a compatible
SDK version installed yourself.

## Requirements

- **Unity 2022.3.** The package manifest targets this version specifically.
- **VRChat Worlds SDK `3.5.x`**, resolved automatically by VCC.

## What's in the package

The manifest's own description sums up what you're adding: structured initialization,
dependency wiring, and editor codegen tooling for building VRChat worlds with UdonSharp.
Concretely, that's the `Runtime/` assembly your world's scripts extend and call into, and
the `Editor/` codegen and configuration tooling that generates the glue between your project
and that runtime — see [How TsVRC fits together](./core-concepts/how-it-fits-together) for how those two
halves relate, and [Build your first behaviour](./first-behaviour) to start using it.

## Assembly layout

The package compiles as one runtime assembly (`Tsvrc.Runtime`) and one editor-only assembly
(`Tsvrc.Editor`) holding all the codegen and Configure-window tooling covered elsewhere in
these docs. Three further assemblies exist purely to support testing a *consumer's* own
project — `Tsvrc.Testing.Framework`, `Tsvrc.Testing.Behaviours`, and `Tsvrc.Testing.UI` —
kept separate from each other and from `Tsvrc.Runtime`/`Tsvrc.Editor` for the reasons
covered in [Testing your world](./testing/testing-your-world).
