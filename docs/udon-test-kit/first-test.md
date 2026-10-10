---
id: first-test
title: Write your first test
sidebar_position: 3
---

# Write your first test

Run the example tests, then write a Play Mode test with two players in a real ClientSim session and
an Edit Mode test with a spy. You need the test assemblies from
[Add Udon Test Kit to your project](./add-to-your-project).

## Run the examples

1. Open **Window > General > Test Runner**.
2. In the **PlayMode** tab, select `ExamplePlayModeTests` and click **Run Selected**.

Unity enters Play Mode, ClientSim starts with a local player, the test spawns a second player, and
the test passes.

If it fails before ClientSim starts, with a message naming project settings, run **Tools > Udon
Test Kit > Fix ClientSim Project Settings** once and run the test again. See
[Fix the project settings ClientSim rejects](./how-to/fixing-clientsim-project-settings).

## Write a Play Mode test

In your `Tests/PlayMode` folder, create `PlayerListTests.cs`:

```csharp
using System.Collections;
using NUnit.Framework;
using UdonTestKit;
using UnityEngine.TestTools;
using VRC.SDKBase;

public class PlayerListTests : ClientSimTestBase
{
    [UnityTest]
    public IEnumerator RemovePlayer_AfterSpawning_LeavesOnlyTheLocalPlayer()
    {
        yield return Session.Start();
        VRCPlayerApi remote = Session.SpawnRemotePlayer("Remote");

        Session.RemovePlayer(remote);

        Assert.That(VRCPlayerApi.GetPlayerCount(), Is.EqualTo(1));
        Assert.That(ClientSimSession.FindPlayerByName("Remote"), Is.Null);
    }
}
```

`ClientSimTestBase` gives the test a `Session` and ends it after the test. `Session.Start` returns
once the local player has joined, and `SpawnRemotePlayer` and `RemovePlayer` take effect before
they return, so the test can assert straight away.

Run it from the **PlayMode** tab. It passes.

## Write an Edit Mode test with a spy

UdonSharp code often calls other behaviours by method name, with `SendCustomEvent`. A spy records
those calls. In your `Tests/EditMode` folder, create `SpyTests.cs`:

```csharp
using NUnit.Framework;
using UdonTestKit;

public class SpyTests
{
    [Test]
    public void SendCustomEvent_TwoSpies_RecordsBothInOrder()
    {
        using var calls = new CallLog();
        CallbackSpy first = calls.CreateSpy("First");
        CallbackSpy second = calls.CreateSpy("Second");

        second.SendCustomEvent(nameof(CallbackSpy.CallbackB));
        first.SendCustomEvent(nameof(CallbackSpy.CallbackA));

        Assert.That(calls, Is.EqualTo(new[] { "Second.CallbackB", "First.CallbackA" }));
    }
}
```

Here the test makes the calls itself. In a real test, you pass the spy to your own code as the
behaviour it calls, and the log shows what your code called, in order. The `using` destroys both
spies when the test ends.

Run it from the **EditMode** tab. It passes.

## Where to go next

To test your own behaviours, add them to GameObjects in a Play Mode test, drive them, and assert on
what they did. The how-to guides cover the usual next steps:

- [Run tests in a scene of their own](./how-to/running-tests-in-their-own-scene), including your
  world's scene.
- [Test what happens for a player who isn't the owner](./how-to/testing-a-player-who-isnt-the-owner).
- [Check that saved data survives a rejoin](./how-to/testing-saved-data).
- [Check the calls your code makes by name](./how-to/checking-calls-made-by-name).
- [Run tests from the command line](./how-to/running-tests-from-the-command-line).
