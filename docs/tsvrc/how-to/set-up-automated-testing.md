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

## 2. Add a test assembly

Create an EditMode or PlayMode test assembly referencing your project's runtime asmdef,
`Tsvrc.Runtime`, and `Tsvrc.Testing.Framework` for the [reflection and ClientSim
helpers](../testing/testing-your-world). Add `Tsvrc.Testing.Behaviours` or
`Tsvrc.Testing.UI` too if your tests need the listener or list-item doubles they provide.

## 3. Arm reactive codegen suppression for Play Mode tests

A test that creates or mutates scene objects can otherwise trigger a real codegen
regenerate pass against your project's actual `TsConfig` mid-test-run. Add a one-line
`[SetUpFixture]` subclass to your PlayMode test assembly to hold that back for the whole
run:

```csharp
[SetUpFixture]
public class AutomaticTriggersSetUpFixture : AutomaticTriggersSetUpFixtureBase { }
```

NUnit only discovers a `[SetUpFixture]` in the assembly it's physically compiled into, so
this needs adding once per test assembly. The base class living in
`Tsvrc.Testing.Framework` isn't enough by itself.

With these three pieces in place, extend
[`TsPlayModeTestBase`](../testing/testing-your-world#play-mode-tests-tsplaymodetestbase)
to write a Play Mode test, or call `PrivateFieldAccess`'s static methods directly for an
Edit Mode one.
