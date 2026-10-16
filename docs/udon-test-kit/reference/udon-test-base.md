---
id: udon-test-base
title: UdonTestBase
sidebar_position: 5
---

# UdonTestBase

`Tsvrc.UdonTestKit.UdonTestBase` is an abstract base class for Play Mode test fixtures that run
behaviours as Udon. It extends [`ClientSimTestBase`](./clientsim-test-base) and gives every test a
new [`UdonHost`](./udon-host) in its protected `Udon` property, which destroys what the test created
with it after the test.

```csharp
public class DoorTests : UdonTestBase
{
    [Test]
    public void Open_Closed_OpensTheDoor()
    {
        UdonBehaviour door = Udon.Create<Door>("Door");

        door.SendCustomEvent(nameof(Door.Open));

        Assert.That(door.GetProgramVariable(nameof(Door.IsOpen)), Is.EqualTo(true));
    }
}
```

Everything from `ClientSimTestBase` is there too. A test that needs players starts the session with
`yield return Session.Start()`, and the session ends after every test.

## Lifecycle

`UdonTestBase` adds two methods to those of `ClientSimTestBase`:

- `[SetUp]` `CreateUdonHost` creates `Udon`. It runs before your own `[SetUp]`.
- `[TearDown]` `DisposeUdonHost` disposes it. It runs after your own `[TearDown]` and before
  `ClientSimTestBase` ends the session, so your `[UnityTearDown]` runs once both are gone.

[ClientSimTestBase](./clientsim-test-base#lifecycle) lists the rest of the order.

## Scenes

`UdonTestBase` has only a parameterless constructor, so its tests run in the Unity Test Framework
test scene, which the whole run shares. To run tests that use Udon in a
[`TestScene`](./test-scene) of their own, extend `ClientSimTestBase` with the scene instead, and
create an `UdonHost` in each test:

```csharp
public class LobbyTests : ClientSimTestBase
{
    public LobbyTests() : base(TestScene.Empty("Lobby"))
    {
    }

    [Test]
    public void Open_Closed_OpensTheDoor()
    {
        using var udon = new UdonHost();
        UdonBehaviour door = udon.Create<Door>("Door");
        // ...
    }
}
```
