---
id: callback-spy-and-call-log
title: CallbackSpy and CallLog
sidebar_position: 4
---

# CallbackSpy and CallLog

`UdonTestKit.CallbackSpy` is a test spy for code that calls an UdonSharpBehaviour's methods by
name, such as with `SendCustomEvent`. `UdonTestKit.CallLog` creates spies and records every call
they receive, in order, as `"GameObjectName.CallbackName"`.

```csharp
using var calls = new CallLog();
CallbackSpy listener = calls.CreateSpy("Listener");
scoreboard.Subscribe(listener, nameof(CallbackSpy.CallbackA));

scoreboard.AddPoint();

Assert.That(calls, Is.EqualTo(new[] { "Listener.CallbackA" }));
```

Both work in Edit Mode and Play Mode tests.
[Check the calls your code makes by name](../how-to/checking-calls-made-by-name) walks through it.

## CallLog

`CallLog` is an `IReadOnlyList<string>` of the calls so far, so NUnit constraints such as
`Is.EqualTo(new[] { ... })` and `Has.Member(...)` work on it directly. It's also `IDisposable`.

- `CreateSpy(string name = "Spy")` creates a GameObject with that name in the active scene, adds a
  `CallbackSpy` to it, and returns the spy.
- `CreateSpy<TSpy>(string name)` does the same with your own subclass of `CallbackSpy`.
- `Clear()` forgets the calls recorded so far, such as the ones a test's setup caused. It doesn't
  destroy any spy.
- `Dispose()` destroys the GameObject of every spy it created, skipping any already destroyed.
  `using var calls = new CallLog();` is all the cleanup a test needs.

Spies created from the same log record into it in the order the calls arrive, so one assertion
checks both how many calls each spy got and their order across spies.

## CallbackSpy

`CallbackSpy` is an `UdonSharpBehaviour` with two callbacks, `CallbackA()` and `CallbackB()`, which
cover most tests. Each call is recorded under the spy's GameObject name at the time of the call.

For callbacks named after what your code calls, subclass it and call `Record()` from each method.
`Record` takes the name of the method that called it:

```csharp
public class DoorSpy : CallbackSpy
{
    public void Open() => Record();
    public void Close() => Record();
}
```

`calls.CreateSpy<DoorSpy>("Door")` then records `"Door.Open"` and `"Door.Close"`.

Put subclasses in an assembly that compiles for every platform, such as the `Doubles` assembly
[`TestAssemblyCreator`](./test-assembly-creator) creates. Unity won't add a behaviour from an
Editor-only assembly to a GameObject, and an Edit Mode test assembly is Editor-only.

## Calls by name outside Udon

Tests run your UdonSharpBehaviours as plain C#, not as Udon. In that mode, `SendCustomEvent`
calls a public method with no parameters and exactly the given name. Any other name does nothing
and raises no error, so a misspelled callback name passes silently: check what the log recorded,
not just that nothing failed.

`SendCustomEventDelayedSeconds` and `SendCustomEventDelayedFrames` don't call anything outside
Udon. Code under test that relies on them needs its delayed method called directly from the test.

## Failure modes

- A `CallbackSpy` that a `CallLog` didn't create throws `InvalidOperationException` on its first
  call, naming the spy and the callback. Add a spy with `CreateSpy`, not `AddComponent`.
- Spies record names only, never arguments.
