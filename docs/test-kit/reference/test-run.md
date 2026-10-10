---
id: test-run
title: TestRun
sidebar_position: 6
---

# TestRun

`Tsvrc.TestKit.TestRun.IsActive` tells editor tooling whether a Unity Test Framework run is in
progress. Tooling that rewrites assets when the domain reloads, an asset is imported or a scene
changes, such as a code generator, can check it and leave a test run alone.

```csharp
if (TestRun.IsActive || EditorApplication.isPlayingOrWillChangePlaymode)
{
    return;
}
```

## When it's true

`IsActive` is true:

- from the moment a run reports its start until it reports its end or an error, whether it was
  started from the Test Runner window or from the command line, and
- for the whole life of a batch-mode Unity process started with `-runTests`, from before the first
  test is found.

The start and end come from Unity Test Framework's public callbacks, which the kit registers again
on every domain load, since registered callbacks don't survive a reload. The flag between them
lives in `SessionState`, so it survives the domain reloads a run causes but not an Editor restart.
A run that crashes without reporting its end can't leave it set for good.

## The reload into Play Mode

A Play Mode run reports its start only after the domain reload into Play Mode. Tooling that reacts
to that reload sees `IsActive` false, so check `EditorApplication.isPlayingOrWillChangePlaymode`
as well, as in the example above.

## Using it

`TestRun` uses Editor APIs, so call it from Editor code. It's in the kit's `Tsvrc.TestKit` assembly:
scripts without an assembly definition can use it directly, and code in an assembly definition
needs a reference to `Tsvrc.TestKit`.
