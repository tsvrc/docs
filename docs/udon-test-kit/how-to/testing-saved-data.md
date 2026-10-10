---
id: testing-saved-data
title: Check that saved data survives a rejoin
sidebar_position: 3
---

# Check that saved data survives a rejoin

ClientSim saves each player's PlayerData and PlayerObjects to files in your project. Ending a
session stops it from saving, so the next session in the same scene starts from what the last one
saved, like a player who leaves and rejoins. That lets one test check that data survives a rejoin.

## Steps

1. Start a session and change the data:

   ```csharp
   yield return Session.Start();
   PlayerData.SetString("coins", "10");
   ```

2. Wait a frame. ClientSim has saved the change by then:

   ```csharp
   yield return null;
   ```

3. End the session and start a new one, the rejoin:

   ```csharp
   Session.End();
   yield return Session.Start();
   ```

4. Assert on what the new session restored:

   ```csharp
   Assert.That(PlayerData.TryGetString(Networking.LocalPlayer, "coins", out string coins), Is.True);
   Assert.That(coins, Is.EqualTo("10"));
   ```

Keep the whole rejoin inside one test. NUnit doesn't promise an order between tests, so a test that
saves and a later test that reads would pass or fail depending on that order.

## Starting from no saved data

Saved data stays on disk after a test, so a later test in the same scene starts from it too. When a
test needs none, delete it before starting the session:

```csharp
ClientSimSession.DeleteSavedData();
yield return Session.Start();
```

`DeleteSavedData` deletes what ClientSim saved for the active scene, for every player. In your
world's own scene, those files are also the ones you get when you press Play.

Unity Test Framework names its test scene differently on every run, so each run leaves a few files
in `ClientSimStorage` that no later run reads. Delete them whenever you like.
