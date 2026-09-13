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
           yield return StartClientSim();
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

Use [`PrivateFieldAccess`](../testing/testing-your-world) instead of making something
`public` just so a test can see it:

```csharp
int remaining = PrivateFieldAccess.GetField<int>(referee, "_remainingMilliseconds");
```

## Asserting an event actually fired

Wire a [`TsCallbackRecorder`](../testing/testing-your-world) as the subscriber instead of
writing a one-off listener class for every test:

```csharp
var recorder = builder.WithNew<TsCallbackRecorder>("Recorder");
referee.TsSubscribe(recorder, RoundReferee.OnRoundEndedEvent, nameof(TsCallbackRecorder.CallbackA));

// ...drive the round to completion...

Assert.AreEqual(1, recorder.CallbackACount);
```

## Why this shape

See [`Testing your world`](../testing/testing-your-world) for the full reasoning behind
building a root from code instead of a saved scene, the two Play Mode testing defects
patched automatically for any `TsPlayModeTestBase` subclass, and why the three testing
assemblies are split the way they are.
