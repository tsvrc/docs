---
id: a-fresh-session-for-every-test
title: "Decision note: a fresh session for every test"
sidebar_position: 2
---

# Decision note: a fresh session for every test

[`ClientSimTestBase`](../reference/clientsim-test-base) ends its ClientSim session after every
test, and the next test starts its own. A session ends completely: `End` leaves nothing of
ClientSim running. The one thing that carries over is saved data, and the kit never deletes it
unless a test asks.

## Why tests don't share a session

A test that starts from a fresh session can't depend on what an earlier test did, so each test
passes or fails on its own, in any order. NUnit doesn't promise an order between tests, so a test
that only passes after another one fails at random. In xUnit Test Patterns' terms, this is a
fresh fixture.

Ending a session completely also lets one test use more than one session. A test can end a session
and start another in the same scene to check that data survives a rejoin, without relying on the
order of tests.

## Why saved data carries over

Carrying over is what saved data is for, and ClientSim keeps it in files, not in the session. The
kit never deletes those files on its own. In your world's own scene, they're your ClientSim data,
and some worlds want them to carry over between tests. `ClientSimSession.DeleteSavedData` is there
for a test that needs none.

## Alternatives considered

- **One session for a whole test class** — faster, since ClientSim starts once, but every test
  then shares whatever the earlier ones changed: players, owners, saved data and every object in
  the scene. That's xUnit Test Patterns' shared fixture, and its known cost is tests that depend on
  each other. It stays possible for tests that only read, by starting the session in a
  `[UnitySetUp]` when it isn't running yet and ending it in `[OneTimeTearDown]`.
- **Deleting saved data after every test** — every test would start clean, but tests run in the
  world's own scene would delete the developer's ClientSim data, and a test of data carrying over
  couldn't be written.

## Scenes follow the same rule

Every test in a Play Mode run shares Unity Test Framework's test scene by default. A
[`TestScene`](../reference/test-scene) with the default `PerTest` lifetime gives each test a fresh
copy of its own scene, and `PerFixture` is the shared option, for tests that don't change it.
