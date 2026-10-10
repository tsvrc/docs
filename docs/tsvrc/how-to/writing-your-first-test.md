---
id: writing-your-first-test
title: Write your first automated test for your own behaviour
sidebar_position: 18
---

# Write your first automated test for your own behaviour

How to write a real Play Mode test against your own `TsvrcBehaviour` subclass, once
[the testing assemblies are wired into your project](./set-up-automated-testing), using
[`TsPlayModeTestBase`](../testing/testing-your-world#play-mode-tests-tsplaymodetestbase).

## Steps

1. Extend `TsPlayModeTestBase` and start ClientSim in a `[UnityTest]`:

   ```csharp
   public class RoundRefereeTests : TsPlayModeTestBase
   {
       [UnityTest]
       public IEnumerator RoundReferee_StartsOnBegin()
       {
           yield return Session.Start();
   ```

2. Build your project's generated root from code instead of loading a saved scene, and
   attach a fresh instance of the behaviour under test:

   ```csharp
           var builder = BuildTsRoot<TsGenerated>();
           var referee = builder.WithNew<RoundReferee>("RoundReferee");
           builder.Build();
   ```

   Any root field your test never touches (a Global, a Pool slot) is auto-filled with a
   bare stand-in before `Build()` runs, so a generated stage that unconditionally
   iterates every field of its module never throws on one your test doesn't care about.

3. Drive the behaviour and assert on it:

   ```csharp
           referee.BeginRound();

           Assert.IsTrue(referee.IsProcessRunning());
       }
   }
   ```

## Reaching a private field or method

Use Udon Test Kit's [`PrivateFieldAccess`](/docs/udon-test-kit/reference/private-field-access)
instead of making something `public` just so a test can see it:

```csharp
int remaining = PrivateFieldAccess.GetField<int>(referee, "_remainingMilliseconds");
```

## Asserting an event actually fired

Subscribe a spy from Udon Test Kit's
[`CallLog`](/docs/udon-test-kit/reference/callback-spy-and-call-log) instead of writing a
one-off listener class for every test:

```csharp
using var calls = new CallLog();
CallbackSpy listener = calls.CreateSpy("Listener");
referee.TsSubscribe(listener, RoundReferee.OnRoundEndedEvent, nameof(CallbackSpy.CallbackA));

// ...drive the round to completion...

Assert.That(calls, Is.EqualTo(new[] { "Listener.CallbackA" }));
```

The log records each call in order, so the same assertion also fails if the event fired
twice.

## Why this shape

See [Testing your world](../testing/testing-your-world) for why the root is built from code
instead of loaded from a saved scene, and how each test gets a scene of its own.
