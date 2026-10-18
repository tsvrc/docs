---
id: udon-sharp-upload-compile
title: UdonSharpUploadCompile
sidebar_position: 10
---

# UdonSharpUploadCompile

`Tsvrc.UdonTestKit.UdonSharpUploadCompile` compiles every UdonSharp program in the project the way
the VRChat SDK has UdonSharp compile them before a world build, so a test can check that your
programs compile for upload as well as for the Editor.

```csharp
[Test]
public void UploadCompile_EveryProgram_LogsNoErrors()
{
    Assert.That(UdonSharpUploadCompile.Run(), Is.Empty);
}
```

Use it in an Edit Mode test, as in
[Check that your world compiles for upload](../how-to/checking-your-world-compiles-for-upload).

## Run

`Run()` compiles every program for upload, for the active build target, and returns the errors that
compile logged, as an `IReadOnlyList<string>`. Then it compiles every program for the Editor again,
so the Editor goes on running programs compiled for the Editor.

It also compiles for the Editor first. UdonSharp runs one compile at a time and queues the next, and
when a compile is under way with another queued, the compile for upload would otherwise end only
after `Run` returned.

The compile for upload reads only player assemblies and leaves out the code inside
`#if UNITY_EDITOR`, so programs that compile in the Editor can fail it, and the VRChat SDK can go on
with a build whose programs failed.
[What the kit works around](../explanations/what-the-kit-works-around#udon-code-that-compiles-for-the-editor-but-not-for-upload)
explains both.

## Failure modes

- The compile also logs the errors, and Unity Test Framework fails a test on an error log it didn't
  expect. `Run` marks each error it returns as expected, so they fail a test only through its
  assertion. Any other error log still fails the test.
- Call it from a test. Outside one, Unity Test Framework has no log scope to expect the errors in,
  and when the compile logs errors, `Run` throws `InvalidOperationException` with
  `No log scope is available`.
- The list holds only the errors logged during the compile for upload. An error logged after `Run`
  returns isn't in it.
