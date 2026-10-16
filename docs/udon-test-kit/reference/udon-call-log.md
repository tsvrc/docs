---
id: udon-call-log
title: UdonCallLog
sidebar_position: 7
---

# UdonCallLog

`Tsvrc.UdonTestKit.UdonCallLog` is a spy that runs as Udon. Test doubles that run as Udon call its
`Add` for each call they get, and a test reads the calls, in order, with
[`UdonHost.Calls`](./udon-host#reading-the-calls-of-an-udoncalllog).

A test double that records into it is an `UdonSharpBehaviour` with a field for the log:

```csharp
public class RoundListenerDouble : UdonSharpBehaviour
{
    public UdonCallLog Log;

    public void OnRoundEnded()
    {
        Log.Add(name + ".OnRoundEnded");
    }
}
```

The test creates both with [`UdonHost`](./udon-host), gives the double the log, and reads the calls:

```csharp
UdonBehaviour log = Udon.Create<UdonCallLog>("Log");
UdonBehaviour listener = Udon.Create<RoundListenerDouble>("Listener");
listener.SetProgramVariable(nameof(RoundListenerDouble.Log), log);

// Act: the code under test calls the listener.

Assert.That(UdonHost.Calls(log), Is.EqualTo(new[] { "Listener.OnRoundEnded" }));
```

## Members

- `Add(string call)` records a call, such as `"Listener.OnRoundEnded"`: the GameObject name, a dot
  and the method.
- `Calls` holds the calls recorded so far as one string, each followed by `;`. `UdonHost.Calls`
  splits it into an array, so a recorded call can't contain `;`.

Its sync mode is None, so nothing it records is synced.

## Its assembly

`UdonCallLog` is in `Tsvrc.UdonTestKit.UdonSpies`, the one kit assembly that compiles into player
builds. UdonSharp compiles only player assemblies for a world upload, so a behaviour that runs as
Udon has to be in one. The assembly has a U# assembly definition, and `UdonCallLog` has its program
asset.

The test assemblies [`TestAssemblyCreator`](./test-assembly-creator) creates reference the
assembly, and scripts without an assembly definition can use it directly. An assembly of Udon test
doubles needs `Tsvrc.UdonTestKit.UdonSpies` in its references.

A world file holds the program of `UdonCallLog` only when a scene in the world has one.
