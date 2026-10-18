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

## Write a double

Doubles that run as Udon go in the `Tests/UdonDoubles` folder that
[Test Assemblies](../reference/test-assembly-creator#the-doubles-assemblies) creates, next to
`ExampleUdonDouble`. Its assembly compiles into player builds, as the compile for upload needs.

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

UdonSharp compiles every U# script of a project together, so no other U# class can have the same
namespace and name as the double.

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
