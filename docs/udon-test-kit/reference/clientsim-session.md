---
id: clientsim-session
title: ClientSimSession
sidebar_position: 1
---

# ClientSimSession

`UdonTestKit.ClientSimSession` starts ClientSim for a Play Mode test, gives the test real
`VRCPlayerApi` players, and ends ClientSim so that nothing of it is left running.
[`ClientSimTestBase`](./clientsim-test-base) holds one and ends it after every test; create one
yourself only when your test class doesn't extend it.

```csharp
var session = new ClientSimSession();
yield return session.Start();

VRCPlayerApi remote = session.SpawnRemotePlayer("Remote");
// ...

session.End();
```

## Starting

`Start(bool localPlayerIsMaster = true)` is a coroutine, so `yield return` it from a `[UnityTest]`
or a `[UnitySetUp]`. It returns once the local player has joined and, with player persistence on,
once that player's saved data is restored. ClientSim reports that it's ready before the restore,
and a PlayerData change made in between is never saved, so returning on "ready" alone would lose
the first thing a test writes.

Before ClientSim starts, `Start` does two things:

1. It runs the same project settings check ClientSim runs, and fails the test if it doesn't pass.
   The failure message names each setting that fails and the menu item that fixes them, described
   in [ClientSimProjectSettings](./clientsim-project-settings).
2. When no loaded scene has a scene descriptor, it adds one: a GameObject named
   `__TestSceneDescriptor` with a single spawn point at the origin. ClientSim refuses to start
   without a descriptor. When a scene already has one, such as your world's own scene, the
   session adds nothing and the local player spawns at that descriptor's spawn point.

With `localPlayerIsMaster: false`, ClientSim spawns a remote player before the local one, and
that remote player is the master. The session then starts with two players.

If ClientSim isn't ready within 10 seconds, `Start` throws a `TimeoutException`.

## Players

`SpawnRemotePlayer(string displayName)` spawns a remote player and returns it. The player is in
the player list by the time the call returns, so a test can assert on it in the same frame. The
returned player is looked up by display name, so give every player its own.

`RemovePlayer(VRCPlayerApi player)` removes a player, also within the call.

`ClientSimSession.FindPlayerByName(string displayName)` is static and returns the player with that
display name, or `null` when there's none.

## Ownership

`SetOwner(VRCPlayerApi player, GameObject obj)` makes `player` the owner of `obj`, the way
`Networking.SetOwner` does in VRChat.

ClientSim tracks an owner only for GameObjects with `VRCObjectSync` or `VRCObjectPool`. The master
owns every other GameObject, including one holding an UdonSharpBehaviour, and
`Networking.SetOwner` leaves it unchanged. In VRChat, every networked GameObject's owner can
change, so code that takes ownership can't be tested against ClientSim as it is.

`SetOwner` gives such a GameObject an owner of its own. It adds a hidden component that ClientSim
reads and writes ownership through, starting from the GameObject's current owner, the master, as
in VRChat. Then it moves ownership to `player`. From then on, `Networking.SetOwner` calls on that
GameObject move its ownership too, including the ones the code under test makes. Calling
`SetOwner` again reuses the component instead of adding another. On a GameObject that already has
`VRCObjectSync` or `VRCObjectPool`, it only calls `Networking.SetOwner`.
[Test what happens for a player who isn't the owner](../how-to/testing-a-player-who-isnt-the-owner)
shows it in a test.

## Ending

`End()` stops ClientSim, stops it saving player data, and removes the scene descriptor `Start`
added, if it added one. It's safe to call when no session is running, so a teardown can call it
unconditionally.

ClientSim keeps each player's saved data on a hidden object that its own teardown never destroys.
That object keeps rewriting the player's save file after ClientSim stops, and overwrites whatever
a later session in the same scene saves. `End` destroys it. With nothing left running, the next
session in the same scene starts from the data the last one saved, the way a player who leaves and
rejoins does.

## Saved data

ClientSim saves each player's data in your project folder, one file per player and scene:

- `ClientSimStorage/PlayerData/PlayerData_<playerId>_<scene>.json`
- `ClientSimStorage/PlayerObjects/PlayerObject_<playerId>_<scene>.json`

`ClientSimSession.DeleteSavedData()` is static and deletes both kinds of file for the active scene,
for every player. Nothing else in the kit deletes saved data: in your world's own scene, those
files are your ClientSim data. [Check that saved data survives a rejoin](../how-to/testing-saved-data)
uses both.

Unity Test Framework gives its test scene a new name on every run, so each run leaves a few files
in `ClientSimStorage` that no later run reads. You can delete them whenever you like.
