---
id: testing-a-player-who-isnt-the-owner
title: Test what happens for a player who isn't the owner
sidebar_position: 2
---

# Test what happens for a player who isn't the owner

In ClientSim, the master owns every GameObject without `VRCObjectSync` or `VRCObjectPool`, and
`Networking.SetOwner` can't change that. The local player is the master by default, so code that
behaves differently for a player who doesn't own a GameObject never takes that path in a test.
[`Session.SetOwner`](../reference/clientsim-session#ownership) gives the GameObject another owner.

## Steps

1. Start the session and spawn a remote player:

   ```csharp
   yield return Session.Start();
   VRCPlayerApi remote = Session.SpawnRemotePlayer("Remote");
   ```

2. Make the remote player the owner of the GameObject your behaviour is on:

   ```csharp
   Session.SetOwner(remote, door.gameObject);
   ```

3. Call your behaviour as the local player, who now doesn't own it, and assert on what it did:

   ```csharp
   door.Open();

   Assert.That(door.IsOpen, Is.False);
   ```

After `Session.SetOwner`, `Networking.SetOwner` works on that GameObject too. If the code under
test takes ownership before acting, check that it did:

```csharp
door.TakeOverAndOpen();

Assert.That(Networking.IsOwner(door.gameObject), Is.True);
```

## The local player as a non-master

To test as a player who isn't the master, start the session with
`Session.Start(localPlayerIsMaster: false)`. ClientSim spawns a remote player before the local
one, and that player is the master.
