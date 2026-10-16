---
id: checking-calls-made-from-udon
title: Check the calls Udon code makes
sidebar_position: 6
---

# Check the calls Udon code makes

When your code runs as Udon, through [`UdonHost`](../reference/udon-host), give it test doubles that
run as Udon too, and have each double record the calls it gets in an
[`UdonCallLog`](../reference/udon-call-log). For code that runs as plain C#, a `CallbackSpy` does
this instead, as in [Check the calls your code makes by name](./checking-calls-made-by-name).

## Create an assembly for Udon test doubles

Do this once per project. The `Doubles` assembly that the kit creates compiles only for tests, and
UdonSharp compiles only player assemblies for a world upload, so `UdonHost` refuses doubles in it.
Doubles that run as Udon go in a player assembly of their own:

1. Create a folder for them, such as `Tests/UdonDoubles`.
2. In it, create an assembly definition (**Assets > Create > Assembly Definition**), such as
   `MyWorld.Tests.UdonDoubles`. Add `Tsvrc.UdonTestKit.UdonSpies` and `UdonSharp.Runtime` to its
   references, plus any assembly of yours that its doubles use. Leave it on **Any Platform**, with
   no define constraints, so it stays in player builds.
3. Next to it, create a U# assembly definition (**Assets > Create > U# Assembly Definition**) and
   set its source assembly to the assembly definition from step 2.
4. Add the new assembly to the references of your Play Mode test assembly.

The assembly compiles into the player builds of your world, but a world holds the program of a
double only when one of its scenes has that double.

## Write a double

In that folder, create the double with **Assets > Create > U# Script**, which also creates its
program asset. Give it a field for the log and a method for each call your code makes, which adds
the call to the log:

```csharp
using Tsvrc.UdonTestKit;
using UdonSharp;

public class RoundListenerDouble : UdonSharpBehaviour
{
    public UdonCallLog Log;

    public void OnRoundEnded()
    {
        Log.Add(name + ".OnRoundEnded");
    }
}
```

## Check the calls

In a test class that extends [`UdonTestBase`](../reference/udon-test-base), create the log, the
double and the behaviour under test, connect them, act, and assert on what the log recorded:

```csharp
UdonBehaviour log = Udon.Create<UdonCallLog>("Log");
UdonBehaviour listener = Udon.Create<RoundListenerDouble>("Listener");
listener.SetProgramVariable(nameof(RoundListenerDouble.Log), log);
UdonBehaviour referee = Udon.Create<RoundReferee>("Referee");
referee.SetProgramVariable(nameof(RoundReferee.Listener), listener);

referee.SendCustomEvent(nameof(RoundReferee.EndRound));

Assert.That(UdonHost.Calls(log), Is.EqualTo(new[] { "Listener.OnRoundEnded" }));
```

A field that holds an `UdonSharpBehaviour` takes the `UdonBehaviour` that `Create` returned.
Doubles that share a log record into it in the order the calls arrive, so one assertion covers
several doubles and the order between them.
