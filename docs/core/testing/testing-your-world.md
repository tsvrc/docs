---
id: testing-your-world
title: Testing your world
sidebar_position: 1
---

# Testing your world

Test a TsVRC world with [Udon Test Kit](/docs/udon-test-kit/intro), which runs Play Mode tests in a
real ClientSim session and works around the VRChat SDK problems that break them. TsVRC depends on
the kit, so it's already in your project, and TsVRC has no testing helpers of its own: players,
ownership, saved data, spies and reaching private fields all come from the kit.

This page covers what's particular to a TsVRC world: how a test builds TsVRC behaviours, and what
TsVRC's codegen does while tests run. See [Set up automated testing](../how-to/set-up-automated-testing)
to add the assemblies to your project, and [Write your first automated
test](../how-to/writing-your-first-test) for a worked example.

## TsVRC behaviours in a test

A test adds your behaviour to a GameObject with `AddComponent` and constructs it with
`TsConstruct`, the call your generated root makes at world startup. A behaviour that doesn't reach
`_ts` during the test can take `null`:

```csharp
var referee = new GameObject("RoundReferee").AddComponent<RoundReferee>();
referee.TsConstruct((TsRoot)null);
```

`TsConstruct` runs the behaviour's `TsStart` once, as at startup. An `AddComponent`-created
behaviour is plain C#, never compiled to Udon, so Unity doesn't call its `Start()` and the generated
startup sequence never runs for it; the test calls what it needs directly.

Give the test class a [scene of its own](/docs/udon-test-kit/how-to/running-tests-in-their-own-scene),
and everything a test created is destroyed when it ends.

## Codegen during a test run

A test that creates or changes scene objects would otherwise trigger TsVRC's reactive codegen,
which could regenerate your project's real output against the test's temporary scene.
[`TsGenerator`](../codegen/internals/ts-generator) skips every automatic trigger while tests run,
from the Test Runner window or the command line, and while the Editor enters Play Mode, so there's
nothing to set up for it.
