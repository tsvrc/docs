---
id: udon-host
title: UdonHost
sidebar_position: 4
---

# UdonHost

`Tsvrc.UdonTestKit.UdonHost` runs UdonSharp behaviours in a Play Mode test as their compiled Udon
programs, the way VRChat runs them, instead of as their C# classes. Disposing it destroys the
GameObjects it created. [`UdonTestBase`](./udon-test-base) gives every test one, and
[Run your behaviours as Udon](../how-to/running-behaviours-as-udon) walks through using it.

```csharp
using var udon = new UdonHost();
UdonBehaviour door = udon.Create<Door>("Door");

door.SendCustomEvent(nameof(Door.Open));

Assert.That(door.GetProgramVariable(nameof(Door.IsOpen)), Is.EqualTo(true));
```

A behaviour that a test adds with `AddComponent` runs as plain C#. One created with `UdonHost` runs
the program UdonSharp compiled from it, so the test sees what Udon does with that code, including
Udon halting the behaviour when it throws.

## Creating behaviours

`Create<T>(string name, bool active = true)` creates a GameObject named `name` with an
`UdonBehaviour` that runs the compiled program of `T`, an `UdonSharpBehaviour`, and returns that
`UdonBehaviour`. The test reaches the program through it, by the names of the methods and fields
of `T`: `SendCustomEvent`, `SetProgramVariable` and `GetProgramVariable`.

With `active: false`, the GameObject starts inactive, and the behaviour starts once the test
activates it. Udon runs the `Start` of a program on a later frame, so a test that checks what
`Start` did yields until `UdonBehaviour.HasDoneStart` is true.

`Create` throws an `InvalidOperationException` that says what to do in two cases:

- `T` has no program asset. A script made with **Assets > Create > U# Script** gets one along with
  it. For a script without one, the error reads
  `Door has no UdonSharp program asset. Create one with Assets > Create > VRChat > Udon > Udon C# Program Asset and set its Source Script.`
- `T` is in an assembly that player builds leave out. The compile UdonSharp runs for a world upload
  reads only player assemblies, and a program asset whose script is in any other assembly makes
  that compile log an error and compile no program at all. The error names the assembly and points
  to **Assets > Create > U# Assembly Definition**.

The second case covers the `Doubles` assembly that
[`TestAssemblyCreator`](./test-assembly-creator) creates, which compiles only for tests. Test
doubles that run as Udon go in the `UdonDoubles` assembly it creates for them, as in
[Check the calls Udon code makes](../how-to/checking-calls-made-from-udon).
[What the kit works around](../explanations/what-the-kit-works-around#udon-code-that-compiles-for-the-editor-but-not-for-upload)
explains the upload compile.

## Disposing

`Dispose()` destroys every GameObject that `Create` made, skipping any the test destroyed already.
`using var udon = new UdonHost();` is all the cleanup a test needs.

## Reading the calls of an UdonCallLog

`UdonHost.Calls(UdonBehaviour log)` is static and returns the calls an
[`UdonCallLog`](./udon-call-log) recorded, in the order they arrived. Pass the `UdonBehaviour` that
`Create<UdonCallLog>` returned. It returns a new array on each call, so a test that changes it
leaves the log as it was.

## Expecting an Udon exception

`UdonHost.ExpectUdonException(Action act)` is static and a coroutine: yield it from a
`[UnityTest]`. It runs `act`, which makes an Udon behaviour throw, and expects the error Udon logs
as it halts the behaviour:

```csharp
yield return UdonHost.ExpectUdonException(() => door.SendCustomEvent(nameof(Door.Unlock)));
```

UdonSharp logs a copy of that error on a later frame, which would fail the next test.
`ExpectUdonException` waits up to 10 frames for the copy and expects it too if it comes.
UdonSharp doesn't always log the copy, as
[What the kit works around](../explanations/what-the-kit-works-around#an-udon-exception-that-fails-the-next-test)
explains.

When `act` doesn't make Udon throw, the error it expects never comes, and Unity Test Framework fails
the test. Like any coroutine, it does nothing until the test yields it.

## Edge cases

- Use it in Play Mode tests. A behaviour created with it doesn't need ClientSim, so start a
  [`ClientSimSession`](./clientsim-session) only when the behaviour needs players.
- Udon runs the events a program delays with `SendCustomEventDelayedFrames` and
  `SendCustomEventDelayedSeconds` on a later frame, once the delay has passed, never during the call
  that delays them. A test waits for them in a `[UnityTest]`, as in
  [Run your behaviours as Udon](../how-to/running-behaviours-as-udon#wait-for-delayed-events).
- It runs each program as UdonSharp last compiled it, normally the compile for the Editor, which
  keeps the code inside `#if UNITY_EDITOR`. To check the compile for upload, use
  [`UdonSharpUploadCompile`](./udon-sharp-upload-compile).
