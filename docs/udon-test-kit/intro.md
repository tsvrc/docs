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
