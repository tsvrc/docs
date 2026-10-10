---
id: testing-your-world
title: Testing your world
sidebar_position: 1
---

# Testing your world

TsVRC's testing helpers build on [Udon Test Kit](/docs/udon-test-kit/intro), which runs Play Mode
tests in a real ClientSim session and works around the VRChat SDK problems that break them. TsVRC
depends on the kit, so the Creator Companion installs it along with TsVRC.

This page covers what TsVRC adds for testing a TsVRC world: a base class that builds your
generated root from code, helpers for list UI, and codegen that holds back while tests run. For
everything else, such as players, ownership, saved data, spies and reaching private fields, use
the kit directly. See [Set up automated testing](../how-to/set-up-automated-testing) to add the
assemblies to your project, and [Write your first automated
test](../how-to/writing-your-first-test) for a worked example.

## Play Mode tests: TsPlayModeTestBase {/* #play-mode-tests-tsplaymodetestbase */}

`TsPlayModeTestBase` extends the kit's
[`ClientSimTestBase`](/docs/udon-test-kit/reference/clientsim-test-base). A test gets the kit's
`Session` for starting ClientSim and working with players, and `BuildTsRoot<TRoot>()` for
constructing your project's generated composition root from code.

```csharp
public class MyManagerTests : TsPlayModeTestBase
{
    [UnityTest]
    public IEnumerator MyManager_DoesTheThing()
    {
        yield return Session.Start();

        var builder = BuildTsRoot<TsGenerated>();
        var myManager = builder.WithNew<MyManager>("MyManager");
        builder.Build();

        myManager.DoTheThing();
        // Assert...
    }
}
```

Every test runs in an empty scene of its own, which is unloaded after the test. Every GameObject
the test or the builder created goes with it, so the next test starts from nothing.

`BuildTsRoot` composes your generated root with `AddComponent` rather than loading a saved
scene, then drives the same `_TsLogStart`/`_TsMemoryStart`/`_TsGlobalStart`/`_TsPoolStart`/
`_TsConstructStart`/`_TsInstanceStart` sequence a real client only gets from Unity
dispatching `Start()` on a scene-loaded object. This isn't a shortcut taken for convenience:
an `AddComponent`-created object is plain C#, never compiled to Udon bytecode, so there's no
VM gating `Start()`/`SendCustomEvent` dispatch the way there is for a real, saved scene's
baked-in Udon behaviours. Composing this way is what makes the sequence actually run at all
in a test.

`WithNew<T>(fieldName)` (used above) creates a fresh `T` and assigns it into the named root
field; `With<T>(fieldName, instance)` assigns an instance you already built yourself instead.
Any root field neither call touched is auto-filled with a bare `AddComponent` stand-in the
moment `Build()` runs, so a generated stage that unconditionally iterates every field of its
module (`_TsGlobalStart` calling `TsConstruct` on every registered global, for example) never
throws a null reference on a field the test never cared about.

## Codegen during a test run

A test that creates or changes scene objects would otherwise trigger TsVRC's reactive codegen,
which could regenerate your project's real output against the test's temporary scene.
[`TsGenerator`](../codegen/internals/ts-generator) skips every automatic trigger while tests run,
from the Test Runner window or the command line, so there's nothing to set up for it.

## List UI: Tsvrc.Testing.UI

`Tsvrc.Testing.UI` provides `TestListItem`, a generic `ListItem` double, and
`TsvrcListTestBuilder.Build(...)`, which wires a bare `TsvrcList`'s private fields the same way
you'd otherwise have to by hand.

## The assemblies

TsVRC ships two testing assemblies, and a test assembly references whichever it needs:

- **`Tsvrc.Testing.Framework`** holds `TsPlayModeTestBase` and the root builder. It's Editor-only
  plain C#, and none of its types are added to GameObjects.
- **`Tsvrc.Testing.UI`** holds the list doubles, which tests add to GameObjects as components.
  Unity won't add a behaviour from an Editor-only assembly to a GameObject, so this one targets
  every platform.

Both compile only when Unity Test Framework includes tests (`UNITY_INCLUDE_TESTS`), so neither
can reach a world build.
