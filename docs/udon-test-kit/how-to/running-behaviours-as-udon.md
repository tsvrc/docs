---
id: running-behaviours-as-udon
title: Run your behaviours as Udon
sidebar_position: 5
---

# Run your behaviours as Udon

A behaviour a test adds with `AddComponent` runs as plain C#. To test what Udon does with your
code, such as halting a behaviour that throws, run it as its compiled Udon program with
[`UdonHost`](../reference/udon-host), in a Play Mode test.

The behaviour needs a program asset, which a script made with **Assets > Create > U# Script** has.
Its assembly has to be in player builds and referenced by your Play Mode test assembly, as the
assembly definitions of your world and the `UdonDoubles` assembly the kit creates are.

## Steps

1. Extend [`UdonTestBase`](../reference/udon-test-base) in your Play Mode test class:

   ```csharp
   public class DoorTests : UdonTestBase
   {
   }
   ```

2. In a test, create the behaviour with `Udon.Create`. It returns the `UdonBehaviour` that runs the
   program:

   ```csharp
   UdonBehaviour door = Udon.Create<Door>("Door");
   ```

3. Arrange and drive it by the names of its fields and methods, then assert on its fields:

   ```csharp
   door.SetProgramVariable(nameof(Door.IsLocked), false);

   door.SendCustomEvent(nameof(Door.Open));

   Assert.That(door.GetProgramVariable(nameof(Door.IsOpen)), Is.EqualTo(true));
   ```

`UdonTestBase` destroys the GameObjects `Udon` created after every test.

## Check that your code throws

When code that runs as Udon throws, Udon halts the behaviour and logs an error, which fails the test
unless the test expects it. Expect it with `UdonHost.ExpectUdonException`, from a `[UnityTest]`:

```csharp
[UnityTest]
public IEnumerator Unlock_NoKeyAssigned_HaltsTheDoor()
{
    UdonBehaviour door = Udon.Create<Door>("Door");

    yield return UdonHost.ExpectUdonException(() => door.SendCustomEvent(nameof(Door.Unlock)));
}
```

The test fails if `Unlock` doesn't throw.

## Wait for delayed events

When your code delays an event with `SendCustomEventDelayedFrames` or
`SendCustomEventDelayedSeconds`, Udon runs it on a later frame, once the delay passed, and never
during the call that delays it. Wait for it in a `[UnityTest]`, longer than the delay:

```csharp
[UnityTest]
public IEnumerator OpenInASecond_AfterTheSecond_OpensTheDoor()
{
    UdonBehaviour door = Udon.Create<Door>("Door");

    door.SendCustomEvent(nameof(Door.OpenInASecond));
    yield return new WaitForSeconds(1.5f);

    Assert.That(door.GetProgramVariable(nameof(Door.IsOpen)), Is.EqualTo(true));
}
```

## Behaviours that need players

`UdonTestBase` extends `ClientSimTestBase`, so start the session first, as in any ClientSim test:

```csharp
yield return Session.Start();
UdonBehaviour door = Udon.Create<Door>("Door");
```

To run these tests in a scene of their own, pass a [`TestScene`](../reference/test-scene) to the
[`UdonTestBase` constructor](../reference/udon-test-base#constructors).
