---
id: sharing-a-session-between-tests
title: Share one session between the tests in a class
sidebar_position: 5
---

# Share one session between the tests in a class

Starting ClientSim for every test is what keeps tests independent, but it takes time. For tests
that only read, such as several checks on the same starting state, one session can serve the whole
class.

`ClientSimTestBase` ends its session after every test, so don't extend it here. Create a
[`ClientSimSession`](../reference/clientsim-session) yourself, start it in the first `[UnitySetUp]`,
and end it in `[OneTimeTearDown]`:

```csharp
public class StartingStateTests
{
    private readonly ClientSimSession _session = new ClientSimSession();
    private bool _started;

    [UnitySetUp]
    public IEnumerator StartSessionOnce()
    {
        if (_started)
        {
            yield break;
        }
        _started = true;
        yield return _session.Start();
    }

    [OneTimeTearDown]
    public void EndSession()
    {
        _session.End();
    }
}
```

NUnit uses one instance of the class for all of its tests, so `_started` stays true after the
first test. Unity Test Framework 1.1 has no setup that runs once per class and can wait for frames,
which is why the start goes in `[UnitySetUp]`.

Tests that share a session also share whatever the earlier ones changed: players, owners, saved
data and objects in the scene. A test that changes any of them belongs in a class with a fresh
session per test. See
[Decision note: a fresh session for every test](../explanations/a-fresh-session-for-every-test)
for the tradeoff.
