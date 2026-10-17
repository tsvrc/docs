---
id: intro
title: Udon Test Kit
sidebar_position: 1
---

# Udon Test Kit

Udon Test Kit lets you write automated tests for a VRChat world with Unity Test Framework. Play
Mode tests run your UdonSharp behaviours in a real ClientSim session, with real players.

## Why test your world

An automated test is a small piece of code that runs part of your world and checks the result,
such as that a door opens only for the player who owns it. Unity runs these tests with its
[Unity Test Framework](https://docs.unity3d.com/Packages/com.unity.test-framework@1.1/manual/index.html),
either in the Editor (Edit Mode) or with the game running (Play Mode).

Once written, tests run again whenever you ask, all at once. A change that breaks something shows
up right away, before you upload the world, and you can change your code without worrying about
breaking something you aren't looking at. That matters most for what's hardest to check by playing
on your own: several players, who owns what, and data that has to survive a rejoin. The Unity
[testing and quality assurance tips](https://unity.com/how-to/testing-and-quality-assurance-tips-unity-projects)
go into more depth.

## What you can do with it

- Spawn and remove players, and choose who is the master.
- Give any GameObject an owner, to test what a player who doesn't own it sees.
- Keep saved data between sessions, like a player who leaves and rejoins.
- Record the calls your code makes by name, such as with `SendCustomEvent`.
- Run your behaviours as their compiled Udon programs, to see what Udon does with your code.
- Check that your world compiles for upload, and which programs its build holds.
- Run each test in a scene of its own, empty or your world scene.
- Create the test assemblies your world needs from one menu item.

The kit stays out of your world build: everything but one Udon spy compiles only for tests, and
that spy reaches a world only when a scene has one. So do the test doubles you write to run as
Udon.

It also includes two standalone scripts that run the tests of a project in one command and print
only what failed: `Invoke-UnityTests.ps1` for PowerShell on Windows and `run_unity_tests.sh` for
Bash on Linux. They work in any Unity project, with or without the kit.

## Get started

1. [Add Udon Test Kit to your project](./add-to-your-project)
2. [Write your first test](./first-test)

## Common tasks

- [Run tests in a scene of their own](./how-to/running-tests-in-their-own-scene)
- [Test what happens for a player who isn't the owner](./how-to/testing-a-player-who-isnt-the-owner)
- [Check that saved data survives a rejoin](./how-to/testing-saved-data)
- [Run your behaviours as Udon](./how-to/running-behaviours-as-udon)
- [Check that your world compiles for upload](./how-to/checking-your-world-compiles-for-upload)
- [Run tests from the command line](./how-to/running-tests-from-the-command-line)

## Reference and background

- [ClientSimSession](./reference/clientsim-session), where most tests start
- [What the kit works around](./explanations/what-the-kit-works-around)
- [Decision note: a fresh session for every test](./explanations/a-fresh-session-for-every-test)
