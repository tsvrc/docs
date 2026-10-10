---
id: writing-your-first-test
title: Write your first automated test for your own behaviour
sidebar_position: 18
---

# Write your first automated test for your own behaviour

How to write a real Play Mode test against your own `TsvrcBehaviour` subclass with
[Udon Test Kit](/docs/udon-test-kit/intro), once [your test assemblies are set
up](./set-up-automated-testing).

## Steps

1. Extend the kit's [`ClientSimTestBase`](/docs/udon-test-kit/reference/clientsim-test-base), give
   the class a scene of its own, and start ClientSim in a `[UnityTest]`:

   ```csharp
   public class RoundRefereeTests : ClientSimTestBase
   {
       public RoundRefereeTests() : base(TestScene.Empty("RoundRefereeTests"))
       {
       }

       [UnityTest]
       public IEnumerator BeginRound_Owner_StartsTheRound()
       {
           yield return Session.Start();
   ```

   Every test gets a fresh empty scene, and everything it creates goes when the scene unloads.

2. Add the behaviour under test to a GameObject and construct it, as your generated root does at
   world startup:

   ```csharp
           var referee = new GameObject("RoundReferee").AddComponent<RoundReferee>();
           referee.TsConstruct((TsRoot)null);
   ```

   Pass `null` when the behaviour doesn't reach `_ts` during the test.

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

## Testing as a player who isn't the owner

A `Process` such as `RoundReferee` acts only for its owner and forwards everything else. Hand it to
a remote player with the kit's `Session.SetOwner` to test the other side, as in
[Test what happens for a player who isn't the owner](/docs/udon-test-kit/how-to/testing-a-player-who-isnt-the-owner).

## Why this shape

See [Testing your world](../testing/testing-your-world) for how a test builds TsVRC behaviours
and what TsVRC's codegen does during a test run.
