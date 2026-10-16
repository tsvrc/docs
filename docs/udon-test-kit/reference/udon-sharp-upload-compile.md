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

The compile for upload reads only player assemblies and leaves out the code inside
`#if UNITY_EDITOR`, so programs that compile in the Editor can fail it, and the VRChat SDK can go on
with a build whose programs failed.
[What the kit works around](../explanations/what-the-kit-works-around#udon-code-that-compiles-for-the-editor-but-not-for-upload)
explains both.

## Failure modes

- The errors are also logged, and Unity Test Framework fails a test on an error log it didn't
  expect, so a test whose compile logs errors fails even before its assertion runs. To look at the
  list instead, set
  [`LogAssert.ignoreFailingMessages`](https://docs.unity3d.com/Packages/com.unity.test-framework@1.1/api/UnityEngine.TestTools.LogAssert.html)
  to `true` first.
- The list holds only the errors logged during the compile for upload. An error logged after `Run`
  returns isn't in it.
