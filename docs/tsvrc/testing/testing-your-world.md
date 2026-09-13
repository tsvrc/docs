---
id: testing-your-world
title: Testing your world
sidebar_position: 1
---

# Testing your world

TsVRC ships a small set of testing helpers your own project can use to write real,
ClientSim-backed Play Mode tests (and plain reflection-based Edit Mode tests) against your
own `UdonSharpBehaviour`s, without hand-rolling VRChat SDK setup and working around its Play
Mode quirks yourself. See [Set up automated testing](../how-to/set-up-automated-testing)
for how to add these assemblies to your project, and [Write your first automated
test](../how-to/writing-your-first-test) for a worked example; this page covers what
these assemblies give you.

Nothing here does anything to your project just by being referenced. Every piece of
behavior only activates when you actually use it. `PrivateFieldAccess` is a set of plain
static methods with no base class requirement; `TsPlayModeTestBase` and its ClientSim
machinery only run for a test class that actually extends it.

## Reflection helpers: PrivateFieldAccess

`SetField`/`GetField`/`InvokeStatic`/`InvokeInstance` reach private fields and methods on
any object or static type from a test, useful for asserting on internal state a
behaviour's public surface doesn't expose. Standalone, works in either Edit Mode or Play
Mode.

## Play Mode tests: TsPlayModeTestBase {/* #play-mode-tests-tsplaymodetestbase */}

Extend `TsPlayModeTestBase` instead of setting up ClientSim by hand. It exposes `Players`
(a `ClientSimPlayerEnvironment`, for spawning, removing, or finding real `VRCPlayerApi`
instances in the test), `StartClientSim(...)` to begin a session, and
`BuildTsRoot<TRoot>()` to construct your project's generated composition root from code.

```csharp
public class MyManagerTests : TsPlayModeTestBase
{
    [UnityTest]
    public IEnumerator MyManager_DoesTheThing()
    {
        yield return StartClientSim();

        var builder = BuildTsRoot<TsGenerated>();
        var myManager = builder.WithNew<MyManager>("MyManager");
        builder.Build();

        myManager.DoTheThing();
        // Assert...
    }
}
```

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
throws a null reference on a field the test never cared about. `TsPlayModeTestBase` tracks
and tears down every GameObject the builder created, including those auto-filled
stand-ins, automatically.

Two known VRChat SDK and Unity Test Framework Play Mode testing defects are patched
automatically for any class extending `TsPlayModeTestBase`. One, a `ClientSim` player-object
leak that piles up conflicting writers on the same file across back-to-back tests, goes
through `FixupRegistry`, which runs every registered `IPlayModeEnvironmentFixup`'s hooks at
the matching lifecycle point; if a future SDK version fixes it upstream, disable it with
`FixupRegistry.Disable<TFixup>()` rather than forking the testing framework itself. The
other, restoring Unity Test Framework's own Play Mode result reporting (which VRChat SDK's
event-listener filter otherwise strips), isn't registered there: it patches itself in via
its own domain-load-time static constructor the first time it detects a `TsPlayModeTestBase`
subclass anywhere in the project, before `FixupRegistry` or any test lifecycle hook ever
runs. `FixupRegistry.Disable<TFixup>()` has no effect on it, since it's never part of the
registry's own list to begin with.

Stopping TsVRC's own reactive codegen from regenerating against a test's temporary scene
during a test run (see [`TsGenerator`](../codegen/internals/ts-generator)'s
`SuppressAutomaticTriggers`) requires reaching an `internal` editor API from outside the
package, granted once, package-wide, via an `InternalsVisibleTo` attribute, rather than
something you need to configure yourself.

That suppression itself isn't automatic per test class the way the `TsPlayModeTestBase`
fixups are. It has to be armed once per test assembly, for the assembly's entire run, via
`AutomaticTriggersSetUpFixtureBase`. See [Set up automated
testing](../how-to/set-up-automated-testing) for the one-line subclass this requires.

## Two companion assemblies, and why they're separate

`Tsvrc.Testing.Framework` is a plain, editor-only C# library: none of its own types are meant
to be `AddComponent`'d as real Udon components. Two more pieces need to actually run as
`UdonSharpBehaviour`s, so they live in their own sibling assemblies instead:

- **`Tsvrc.Testing.Behaviours`** provides `TsCallbackRecorder`, a generic `TsSubscribe`/
  `TsEmit` listener double that records how many times each callback fired (and, via an
  optional shared log, cross-listener firing order).
- **`Tsvrc.Testing.UI`** provides `TestListItem` (a generic `ListItem` double) and
  `TsvrcListTestBuilder.Build(...)`, which wires a bare `TsvrcList`'s private fields the same
  way you'd otherwise have to by hand.

The split exists because of an UdonSharp constraint: `AddComponent` only works for scripts
in an assembly registered as a U# assembly, and once registered, UdonSharp Udon-compiles
*every* source file in that assembly. Keeping the reflection/ClientSim helpers in a
separate, non-U#-registered assembly is what stops them from being dragged into a
compilation context they were never meant to run under. Some of them reach `internal`
editor APIs that Udon's compiler simply can't resolve. Add whichever companion assembly a
given test actually needs, alongside `Tsvrc.Testing.Framework`; none of the three depend on
each other beyond that. All three carry a `UNITY_INCLUDE_TESTS` define constraint, so none
of them compile at all outside a test context, regardless of platform: nothing here can ship
in a built world by accident.

See [Set up automated testing](../how-to/set-up-automated-testing) for how to reference
these assemblies from your own project.
