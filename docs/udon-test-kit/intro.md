---
id: intro
title: Udon Test Kit
sidebar_position: 1
---

# Udon Test Kit

Udon Test Kit lets you test a VRChat world with Unity Test Framework. Play Mode tests run a real
ClientSim session with real `VRCPlayerApi` players, and the kit works around the VRChat SDK and
ClientSim problems that otherwise break those tests.

A test extends `ClientSimTestBase` and starts its `Session`. From there it can spawn and remove
remote players, choose who is master, give any GameObject an owner, and check what your behaviours
did with all of it. Each test can run in a scene of its own, including your world's own scene.
Spies record the calls your code makes by method name, such as `SendCustomEvent`, and a menu item
creates the test assemblies a world needs in one step.

The kit compiles only when Unity Test Framework includes tests, so nothing from it reaches a world
build.

## New to the kit?

Start with [Add Udon Test Kit to your project](./add-to-your-project), then
[Write your first test](./first-test): by the end you'll have a Play Mode test with two players and
an Edit Mode test with a spy, both passing in the Test Runner.

## Already using it?

Jump straight to what you need:

- **Doing a specific task** — [run tests in a scene of their own](./how-to/running-tests-in-their-own-scene),
  [test a player who isn't the owner](./how-to/testing-a-player-who-isnt-the-owner),
  [check that saved data survives a rejoin](./how-to/testing-saved-data), or
  [run tests from the command line](./how-to/running-tests-from-the-command-line).
- **Looking up a type's behavior** — start from [ClientSimSession](./reference/clientsim-session),
  or browse Reference in the sidebar.
- **Understanding what the kit changes and why** —
  [What the kit works around](./explanations/what-the-kit-works-around) and
  [a fresh session for every test](./explanations/a-fresh-session-for-every-test).
