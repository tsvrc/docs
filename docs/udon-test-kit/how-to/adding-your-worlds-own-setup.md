---
id: adding-your-worlds-own-setup
title: Share your test setup in a base class
sidebar_position: 8
---

# Share your test setup in a base class

When every test needs the same setup, such as your world scene, a running session and the objects
your tests look up, put it in a base class of your own that extends `ClientSimTestBase`, and extend
that in your test classes.

```csharp
public abstract class MyWorldTestBase : ClientSimTestBase
{
    protected Scoreboard Board;

    protected MyWorldTestBase() : base(TestScene.FromAsset("Assets/Scenes/MyWorld.unity"))
    {
    }

    [UnitySetUp]
    public IEnumerator StartWorld()
    {
        yield return Session.Start();
        Board = Object.FindObjectOfType<Scoreboard>();
    }
}

public class ScoreboardTests : MyWorldTestBase
{
    [UnityTest]
    public IEnumerator AddPoint_ForLocalPlayer_ShowsOnePoint()
    {
        Board.AddPoint();
        yield return null;

        Assert.That(Board.PointsOf(Networking.LocalPlayer), Is.EqualTo(1));
    }
}
```

Use NUnit attributes in your base class as you would in a test class. NUnit runs the setup of a
base class before yours and its teardown after yours, so with `ClientSimTestBase` underneath:

- your `[UnitySetUp]` and `[SetUp]` run with the test scene already loaded and active,
- your `[TearDown]` runs while the session is still running, and
- your `[UnityTearDown]` runs after ClientSim has ended, but before the test scene unloads.

[ClientSimTestBase](../reference/clientsim-test-base#lifecycle) lists the full order.
