---
id: checking-calls-made-by-name
title: Check the calls your code makes by name
sidebar_position: 4
---

# Check the calls your code makes by name

UdonSharp code often calls another behaviour by method name, with `SendCustomEvent`, on a target
and method name it stored earlier, such as a subscriber. Pass a
[`CallbackSpy`](../reference/callback-spy-and-call-log) as that target, and check what its
`CallLog` recorded.

## Steps

1. Create a log with `using var`, so its spies are destroyed when the test ends, and create a spy:

   ```csharp
   using var calls = new CallLog();
   CallbackSpy listener = calls.CreateSpy("Listener");
   ```

2. Give the spy to your code as the target, with one of its callbacks as the method name:

   ```csharp
   scoreboard.Subscribe(listener, nameof(CallbackSpy.CallbackA));
   ```

3. Act, then assert on the calls, in order:

   ```csharp
   scoreboard.AddPoint();

   Assert.That(calls, Is.EqualTo(new[] { "Listener.CallbackA" }));
   ```

Spies created from the same log record into it in the order the calls arrive, so one assertion
covers several spies and the order between them. To ignore calls your setup caused, call
`calls.Clear()` before acting.

## Callbacks with your own names

When your code calls a fixed method name, such as `OnRoundEnded`, subclass `CallbackSpy` and call
`Record()` from a method with that name:

```csharp
public class RoundListenerSpy : CallbackSpy
{
    public void OnRoundEnded() => Record();
}
```

Create it with `calls.CreateSpy<RoundListenerSpy>("Listener")`, and it records
`"Listener.OnRoundEnded"`. Put the subclass in your `Doubles` assembly, so both Edit Mode and Play
Mode tests can use it: Unity won't add a behaviour from the Edit Mode test assembly to a GameObject.

## What to watch for

Outside Udon, as in a test, a call by name reaches only a public method with no parameters and
exactly that name. A misspelled name does nothing and raises no error, so always assert on what the
log recorded, not just that nothing failed.

`SendCustomEventDelayedSeconds` and `SendCustomEventDelayedFrames` never call anything outside
Udon. When the code under test delays a call that way, call the delayed method directly from the
test.
