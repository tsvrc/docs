---
id: set-up-automated-testing
title: Set up automated testing
sidebar_position: 5
---

# Set up automated testing

Wire TsVRC's testing helpers into your project so you can write Play Mode and Edit Mode
tests against your own `UdonSharpBehaviour`s.

## 1. Put your scripts and generated code in one assembly

TsVRC's generated code declares the base types your world scripts extend (`TsBehaviour`,
`TsInstance`, and so on), and in turn references concrete types from your own scripts: a
Construct or Factory entry generates a field typed as whatever class you registered. That's
a two-way dependency, and Unity doesn't allow two assembly definitions to reference each
other. Give your project's own scripts folder a single `asmdef` placed high enough in the
folder tree to cover both your hand-written scripts and wherever your `TsConfig`'s
generated-folder setting points (they don't need to be nested inside each other, just both
under that one asmdef's root), referencing `Tsvrc.Runtime` plus whatever VRChat SDK/
UdonSharp assemblies your scripts use.

## 2. Create your test assemblies

TsVRC's testing helpers build on Udon Test Kit. Create your test assemblies with the kit's
menu item, as described in
[Create your test assemblies](/docs/udon-test-kit/add-to-your-project#create-your-test-assemblies).
They already reference the kit, the VRChat SDK, ClientSim and your project's assembly from
step 1.

## 3. Add TsVRC's testing assemblies

In the `EditMode` and `PlayMode` test assemblies, add these references:

- `Tsvrc.Runtime`, if it isn't listed already.
- `Tsvrc.Testing.Framework`, for [`TsPlayModeTestBase`](../testing/testing-your-world).
- `Tsvrc.Testing.UI`, if your tests need its list doubles.

Add `Tsvrc.Runtime` to the `Doubles` assembly too, if your test doubles extend TsVRC types.

That's all. TsVRC's codegen holds back on its own while tests run, so nothing else needs
arming. Extend [`TsPlayModeTestBase`](../testing/testing-your-world#play-mode-tests-tsplaymodetestbase)
to write a Play Mode test, or use Udon Test Kit's helpers directly in an Edit Mode one.
