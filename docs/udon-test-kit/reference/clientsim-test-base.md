---
id: clientsim-test-base
title: ClientSimTestBase
sidebar_position: 2
---

# ClientSimTestBase

`Tsvrc.UdonTestKit.ClientSimTestBase` is an abstract base class for Play Mode test fixtures that use
ClientSim. It holds a [`ClientSimSession`](./clientsim-session) in its protected `Session` field
and ends it after every test, and it can run every test in a [`TestScene`](./test-scene) of its
own.

```csharp
public class PlayerCountTests : ClientSimTestBase
{
    [UnityTest]
    public IEnumerator SpawnRemotePlayer_InClientSim_JoinsThePlayerList()
    {
        yield return Session.Start();

        VRCPlayerApi remote = Session.SpawnRemotePlayer("Remote");

        Assert.That(VRCPlayerApi.GetPlayerCount(), Is.EqualTo(2));
    }
}
```

The session doesn't start on its own. Each test starts it with `yield return Session.Start()`, so
a test can choose `localPlayerIsMaster: false`, or do work before ClientSim exists.

## Constructors

- `ClientSimTestBase()` runs every test in Unity Test Framework's own test scene, which the whole
  run shares.
- `ClientSimTestBase(TestScene scene, TestSceneLifetime lifetime = TestSceneLifetime.PerTest)` runs
  every test in `scene`. With `PerTest`, the scene is loaded fresh for each test and unloaded after
  it. With `PerFixture`, it's loaded for the first test and unloaded after the last one.

Pass the scene from your fixture's own constructor:

```csharp
public class LobbyTests : ClientSimTestBase
{
    public LobbyTests() : base(TestScene.Empty("Lobby"))
    {
    }
}
```

## Lifecycle

The base class adds four NUnit and Unity Test Framework methods. NUnit runs a base class's setup
before the derived class's and its teardown after, and Unity Test Framework runs every
`[UnityTearDown]` after every `[TearDown]`. Put together, a test with a derived class runs in this
order:

1. `[UnitySetUp]` `LoadTestScene` loads the scene, if there is one, and makes it the active scene.
2. Your `[UnitySetUp]` and `[SetUp]`.
3. The test, which starts the session.
4. Your `[TearDown]`, while the session is still running.
5. `[TearDown]` `EndClientSimSession` calls `Session.End()`.
6. Your `[UnityTearDown]`, after ClientSim has ended and before the scene unloads.
7. `[UnityTearDown]` `UnloadPerTestScene` unloads a `PerTest` scene, destroying everything in it.

After the fixture's last test, `[OneTimeTearDown]` `UnloadPerFixtureScene` unloads a `PerFixture`
scene.

`Session.End()` runs after every test, even when the test failed or never started the session,
because ending a session that isn't running does nothing.
