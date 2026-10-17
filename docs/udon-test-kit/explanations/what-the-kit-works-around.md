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

When Play Mode starts, the VRChat SDK `UnityEventFilter` strips every persistent UnityEvent
listener whose type it doesn't allow, and a stripped listener is never called. The Unity Test
Framework Play Mode runner reports results through listeners of four such types. Without them, a
Play Mode run never reports its results, and a batch-mode run never exits.

The kit adds those four types to the SDK allowlist whenever the Editor loads it, before any test
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

ClientSim keeps the saved data of each player on a hidden object that its own teardown never
destroys. After ClientSim stops, that object keeps rewriting the save file of the player. The next
session in the same scene reads the same file, and within a second the leftover object overwrites
what the new session saved, so a test of saved data passes or fails depending on timing.

`ClientSimSession.End` destroys that object.

## Saved data restored after ClientSim is ready

ClientSim reports that it's ready before it restores the saved data of the local player, and a
PlayerData change made before the restore is never saved. `ClientSimSession.Start` returns only
after the restore.

## Owners that never change

In VRChat, every networked GameObject has an owner that can change. ClientSim tracks an owner only
for GameObjects with `VRCObjectSync` or `VRCObjectPool`. The master owns every other one, and
`Networking.SetOwner` can't change that, so code that behaves differently for a player who isn't
the owner can't be tested. `ClientSimSession.SetOwner` gives any GameObject an owner of its own.

ClientSim also hands the GameObjects of a leaving player to the master only when it tracks their
owner, so an owner added without telling ClientSim would stay with a player who has left. The kit
registers the owner it adds the same way ClientSim registers a `VRCObjectSync`, so the master takes
over, as in VRChat. See [ClientSimSession](../reference/clientsim-session#ownership).

## A test scene with no scene descriptor

ClientSim refuses to start without a scene descriptor, and the Unity Test Framework test scene has
none. `ClientSimSession.Start` adds one when no loaded scene has one.

## A crash after every test passed

`EditorSceneManager.LoadSceneInPlayMode`, which loads a scene asset into a Play Mode test, drops
the operation it loads with. When the garbage collector finalizes that operation as Unity exits,
Unity can crash after every test has passed, so a command-line run reports failure. `TestScene`
finalizes it right after the scene loads, while that's still safe.

## Behaviours added at runtime that run nothing

An `UdonBehaviour` added to a GameObject at runtime doesn't load the compiled program of its program
source, so it runs nothing. It runs a program only once it's given one with
`AssignProgramAndVariables` and registered with `UdonManager`. `UdonHost.Create` does both. See
[UdonHost](../reference/udon-host).

## An Udon exception that fails the next test

When Udon halts a behaviour that threw, it logs an error, and UdonSharp logs a copy of that error on
a later frame. Unity Test Framework fails a test on any error log it didn't expect, so the copy
fails whichever test is running by then, which can be the next one.

UdonSharp doesn't always log the copy. While it watches the log of the VRChat client, as it does by
default, and finds no VRChat installation, it holds the copy back and logs it once watching stops.
`UdonHost.ExpectUdonException` expects the error, waits up to 10 frames for the copy, and expects
the copy only if it comes.

## Udon code that compiles for the Editor but not for upload

Before a world build, the VRChat SDK has UdonSharp compile every program for upload. That compile
reads only player assemblies, while the compile UdonSharp runs in the Editor reads every assembly
with a U# assembly definition. A program asset whose script is in an assembly that player builds
leave out, such as a tests-only one, makes the compile for upload log an error and compile no
program at all, and the build still goes on. The compile for upload also leaves out the code inside
`#if UNITY_EDITOR`, so code that compiles only together with that code fails it.

Tests that run programs in the Editor see none of this. `UdonSharpUploadCompile` runs the compile
for upload in a test, and `UdonHost.Create` refuses a behaviour whose assembly player builds leave
out, so a test double that would break the compile for upload fails its test instead. Test doubles
that run as Udon belong in the `UdonDoubles` assembly `TestAssemblyCreator` creates, which player
builds include. See [UdonSharpUploadCompile](../reference/udon-sharp-upload-compile).

## Test code in a world build

All of the kit except `UdonCallLog` compiles only when Unity Test Framework includes tests
(`UNITY_INCLUDE_TESTS`), and so do the test assemblies it creates, except `UdonDoubles`, so a world
build never includes them. Code that runs as Udon has to be in a player assembly, since UdonSharp
compiles only player assemblies for upload. So `UdonCallLog` has an assembly of its own,
`Tsvrc.UdonTestKit.UdonSpies`, and `UdonDoubles` compiles into player builds too. A world holds the
program of a behaviour only when a scene in the world has that behaviour, so the kit and your Udon
test doubles can stay in a world you upload.
