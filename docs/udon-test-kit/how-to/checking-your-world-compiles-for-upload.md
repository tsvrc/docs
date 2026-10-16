---
id: checking-your-world-compiles-for-upload
title: Check that your world compiles for upload
sidebar_position: 10
---

# Check that your world compiles for upload

Before a world upload, UdonSharp compiles every program again, for upload, and a program that
compiles in the Editor can fail there. Check it in an Edit Mode test with
[`UdonSharpUploadCompile`](../reference/udon-sharp-upload-compile), so a failure shows up before you
upload.

## Steps

1. In your `Tests/EditMode` folder, create `UploadCompileTests.cs`:

   ```csharp
   using NUnit.Framework;
   using Tsvrc.UdonTestKit;

   public class UploadCompileTests
   {
       [Test]
       public void UploadCompile_EveryProgram_LogsNoErrors()
       {
           Assert.That(UdonSharpUploadCompile.Run(), Is.Empty);
       }
   }
   ```

2. Run it from the **EditMode** tab of the Test Runner. It compiles every UdonSharp program in the
   project for upload, then for the Editor again, so it takes longer than most tests.

When a program fails, the test fails with the error UdonSharp logged.

## What makes the compile fail

The compile for upload reads only player assemblies and leaves out the code inside
`#if UNITY_EDITOR`. A program asset whose script is in a tests-only assembly makes it compile no
program at all, and code that compiles only together with code inside `#if UNITY_EDITOR` fails it.
[What the kit works around](../explanations/what-the-kit-works-around#udon-code-that-compiles-for-the-editor-but-not-for-upload)
explains both.
