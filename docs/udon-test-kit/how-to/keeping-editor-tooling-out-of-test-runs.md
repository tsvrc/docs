---
id: keeping-editor-tooling-out-of-test-runs
title: Keep editor tooling from reacting to a test run
sidebar_position: 7
---

# Keep editor tooling from reacting to a test run

Editor tooling that reacts to domain reloads, asset imports or scene changes, such as a code
generator, also reacts to what a test run does: the reloads it causes, the test scene it creates,
the objects tests add. Have the tooling skip its work while tests run, by checking
[`TestRun.IsActive`](../reference/test-run).

```csharp
[InitializeOnLoad]
internal static class MyGenerator
{
    static MyGenerator()
    {
        EditorApplication.hierarchyChanged += Regenerate;
    }

    private static void Regenerate()
    {
        if (TestRun.IsActive || EditorApplication.isPlayingOrWillChangePlaymode)
        {
            return;
        }
        // ...
    }
}
```

`TestRun.IsActive` is true from when a run reports its start until it reports its end, across the
domain reloads in between, and for the whole of a batch-mode process started with `-runTests`. A
Play Mode run reports its start only after the domain reload into Play Mode, so tooling that runs
on that reload also checks `EditorApplication.isPlayingOrWillChangePlaymode`.

If your tooling's code is in an assembly definition, add `Tsvrc.UdonTestKit` to its references.
