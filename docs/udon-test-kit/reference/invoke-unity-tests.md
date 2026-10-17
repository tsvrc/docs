---
id: invoke-unity-tests
title: Invoke-UnityTests.ps1
sidebar_position: 15
---

# Invoke-UnityTests.ps1

`Invoke-UnityTests.ps1` runs the tests of a Unity project from PowerShell on Windows and prints a
short report. It's a single, standalone file: it doesn't use the kit or anything else beyond Unity
Test Framework, and it's meant to be copied into any Unity project that wants it, with or without
the kit. [Run tests from the command line](../how-to/running-tests-from-the-command-line) walks
through using it, and [`run_unity_tests.sh`](./run-unity-tests) does the same from Bash on Linux.

## Getting it

The script is `Scripts~/Invoke-UnityTests.ps1` in the
[kit repository](https://github.com/tsvrc/udon-test-kit). A Creator Companion install also has
it on disk, under `Packages/com.tsvrc.udon-test-kit/Scripts~`. Unity doesn't import folders ending
in `~`, so a `.unitypackage` of the kit can't include it.

Copy it anywhere inside your project, such as its root folder. It finds the project by looking up
from its own folder.

## Running it

Close the Unity Editor first: batch mode can't open a project that another Editor has open. Then:

```powershell
.\Invoke-UnityTests.ps1
```

`Get-Help .\Invoke-UnityTests.ps1 -Detailed` shows the same options as the table below.

## Options

| Option | Default |
| --- | --- |
| `-TestMode` | `All`, which runs `EditMode` and then `PlayMode`. Pass one of those to run one mode. |
| `-AssemblyNames` | Your project's own assemblies, separated with `;` (see below). |
| `-ProjectPath` | The nearest folder with a `ProjectSettings\ProjectVersion.txt`, looking up from the script's folder, then from the current folder. |
| `-UnityPath` | The Editor version in `ProjectVersion.txt`, in the Unity Hub default install folder under `Program Files`. |
| `-ResultsPath` | A new folder under the temp folder, named after the date and time. |
| Any other argument | Goes to Unity, after the arguments of the script. |

Without assembly names, Unity runs every test it finds, including the tests that come with
packages, such as the VRChat SDK. The default list is every assembly definition Unity imports under
`Assets`, plus the assemblies Unity compiles scripts without one into (`Assembly-CSharp`,
`Assembly-CSharp-firstpass`, `Assembly-CSharp-Editor` and `Assembly-CSharp-Editor-firstpass`), so
tests in `Editor` folders run too. Like Unity, it skips folders with the Windows Hidden attribute,
files and folders whose names start with a dot, and folders whose names end with `~`. A name with
no tests in it is harmless.

Arguments the script doesn't know go to Unity, such as a build target:

```powershell
.\Invoke-UnityTests.ps1 -buildTarget win64
```

The Unity manual lists them under
[Editor command line arguments](https://docs.unity3d.com/2022.3/Documentation/Manual/EditorCommandLineArguments.html).

## What it does

Each test mode starts Unity once, in batch mode, with `-runTests`. Unity writes the results of the
mode to `<mode>.xml` and its log to `<mode>.log` in the results folder.

For each mode, the script prints every test that didn't pass, with its result and message, then a
count:

```
PlayMode tests...
FAILED  DoorTests.Open_ByNonOwner_StaysClosed
    Expected: False
      But was:  True
12 passed, 1 failed, 0 inconclusive or skipped
```

An inconclusive test is an `Assume` that didn't hold, so it proved nothing.

## Exit code

The script exits with 1 when Unity reported a failed or inconclusive test, or a run that errored
out, and when a mode wrote no results, in which case it prints the path of the log. Otherwise it
exits with 0, so a build server can use it as a step that fails the build.

It also exits with 1, without starting Unity, when it finds no project or no Unity, or can't create
the results folder, such as when `-ResultsPath` names a file. Its message says which.

## Execution policy

If PowerShell refuses to run the script because of its execution policy, allow local scripts once:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

It runs on Windows PowerShell 5.1, which comes with Windows.
