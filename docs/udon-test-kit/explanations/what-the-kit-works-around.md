---
id: what-the-kit-works-around
title: What the kit works around
sidebar_position: 1
---

# What the kit works around

Unity Test Framework, the VRChat SDK and ClientSim each work on their own. Put together in a Play
Mode test, a few of their behaviors break the test, or make it pass or fail for the wrong reason.
This page lists each one and what the kit does about it.

## Play Mode runs that never finish

When Play Mode starts, the VRChat SDK's `UnityEventFilter` strips every persistent UnityEvent
listener whose type it doesn't allow, and a stripped listener is never called. Unity Test
Framework's Play Mode runner reports results through listeners of four such types. Without them, a
Play Mode run never reports its results, and a batch-mode run never exits.

The kit adds those four types to the SDK's allowlist whenever the Editor loads it, before any test
runs. Nothing needs turning on. The allowlist is internal to the SDK, so if a future SDK moves it,
the kit logs a warning starting with `[UdonTestKit] UnityEventFilterAllowlist:` instead of failing.

## Tests that fail without saying why

ClientSim checks a handful of project settings as it starts. When the check fails, it opens its
settings window, which in batch mode logs errors, and Unity Test Framework fails a test on any
error log it didn't expect. The test fails, and nothing in the result names a setting.

`ClientSimSession.Start` runs the same check first and fails the test with the names of the
failing settings and the menu item that fixes them. See
[ClientSimProjectSettings](../reference/clientsim-project-settings).

## Saved data a finished session overwrites

ClientSim keeps each player's saved data on a hidden object that its own teardown never destroys.
After ClientSim stops, that object keeps rewriting the player's save file. The next session in the
same scene reads the same file, and within a second the leftover object overwrites what the new
session saved, so a test of saved data passes or fails depending on timing.

`ClientSimSession.End` destroys that object.

## Saved data restored after ClientSim is ready

ClientSim reports that it's ready before it restores the local player's saved data, and a
PlayerData change made before the restore is never saved. `ClientSimSession.Start` returns only
after the restore.

## Owners that never change

In VRChat, every networked GameObject has an owner that can change. ClientSim tracks an owner only
for GameObjects with `VRCObjectSync` or `VRCObjectPool`. The master owns every other one, and
`Networking.SetOwner` can't change that, so code that behaves differently for a player who isn't
the owner can't be tested. `ClientSimSession.SetOwner` gives any GameObject an owner of its own.

ClientSim also hands a leaving player's GameObjects to the master only when it tracks their owner,
so an owner added without telling ClientSim would stay with a player who has left. The kit
registers the owner it adds the same way ClientSim registers `VRCObjectSync`'s, so the master takes
over, as in VRChat. See [ClientSimSession](../reference/clientsim-session#ownership).

## A test scene with no scene descriptor

ClientSim refuses to start without a scene descriptor, and Unity Test Framework's test scene has
none. `ClientSimSession.Start` adds one when no loaded scene has one.

VRChat Worlds SDK versions before 3.8.2 also stop Play Mode outright when the scene has no
descriptor, before any test code runs, so every Play Mode run hangs. Nothing in a test can work
around that, which is why the kit requires 3.8.2 or later.

## A crash after every test passed

`EditorSceneManager.LoadSceneInPlayMode`, which loads a scene asset into a Play Mode test, drops
the operation it loads with. When the garbage collector finalized that operation as Unity exited,
Unity crashed after every test had passed, so a command-line run reported failure. `TestScene`
finalizes it right after the scene loads, while that's still safe.

## Test code in a world build

The kit compiles only when Unity Test Framework includes tests (`UNITY_INCLUDE_TESTS`), and so do
the test assemblies it creates. A world build never includes them, so the kit can stay installed
in a world you upload.
