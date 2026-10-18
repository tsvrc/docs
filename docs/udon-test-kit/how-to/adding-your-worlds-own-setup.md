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
    protected UdonBehaviour Board;

    protected MyWorldTestBase() : base(TestScene.FromAsset("Assets/Scenes/MyWorld.unity"))
    {
    }

    [UnitySetUp]
    public IEnumerator StartWorld()
    {
        yield return Session.Start();
        Board = GameObject.Find("Scoreboard").GetComponent<UdonBehaviour>();
    }
}

public class ScoreboardTests : MyWorldTestBase
{
    [UnityTest]
    public IEnumerator AddPoint_Once_CountsOnePoint()
    {
        Board.SendCustomEvent(nameof(Scoreboard.AddPoint));
        yield return null;

        Assert.That(Board.GetProgramVariable(nameof(Scoreboard.Points)), Is.EqualTo(1));
    }
}
```

The world scene runs its UdonSharp behaviours as Udon, so reach one through its `UdonBehaviour`, as
above. `Object.FindObjectOfType<Scoreboard>()` finds the C# component UdonSharp keeps beside it, and
a method called on that runs as C#, apart from the program the scene runs.

Use NUnit attributes in your base class as you would in a test class. NUnit runs the setup of a
base class before yours and its teardown after yours, so with `ClientSimTestBase` underneath:

- your `[UnitySetUp]` and `[SetUp]` run with the test scene already loaded and active,
- your `[TearDown]` runs while the session is still running, and
- your `[UnityTearDown]` runs after ClientSim has ended, but before the test scene unloads.

[ClientSimTestBase](../reference/clientsim-test-base#lifecycle) lists the full order.
