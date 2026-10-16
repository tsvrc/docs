---
id: run-unity-tests
title: run_unity_tests.sh
sidebar_position: 15
---

# run_unity_tests.sh

`run_unity_tests.sh` runs a Unity project's tests from Bash on Linux and prints a short report. It's
a single, standalone file: it doesn't use the kit or anything else beyond Unity Test Framework, and
it's meant to be copied into any Unity project that wants it, with or without the kit.
[Run tests from the command line](../how-to/running-tests-from-the-command-line) walks
through using it, and [`Invoke-UnityTests.ps1`](./invoke-unity-tests) does the same from PowerShell
on Windows.

## Getting it

The script is `Scripts~/run_unity_tests.sh` in the
[kit's repository](https://github.com/tsvrc/udon-test-kit). An installed kit package also has it on
disk, under `Packages/com.tsvrc.udon-test-kit/Scripts~`, unless it came from a `.unitypackage`:
Unity doesn't import folders ending in `~`, so a `.unitypackage` can't include it.

Copy it anywhere inside your project, such as its root folder, and make the copy executable with
`chmod +x run_unity_tests.sh`. It finds the project by looking up from its own folder. It needs
Bash 4 or later and `awk`.

## Running it

Close the Unity Editor first: batch mode can't open a project that another Editor has open. Then:

```bash
./run_unity_tests.sh
```

`./run_unity_tests.sh --help` lists the same options as the table below.

## Options

| Option | Default |
| --- | --- |
| `-m`, `--test-mode` | `All`, which runs `EditMode` and then `PlayMode`. Pass one of those to run one mode. |
| `-a`, `--assembly-names` | Your project's own assemblies, separated with `;` (see below). |
| `-p`, `--project-path` | The nearest folder with a `ProjectSettings/ProjectVersion.txt`, looking up from the script's folder, then from the current folder. |
| `-u`, `--unity-path` | The Editor version in `ProjectVersion.txt`, in the Unity Hub default install folder, `~/Unity/Hub/Editor`. |
| `-r`, `--results-path` | A new folder under `$TMPDIR`, or `/tmp` when it isn't set, named after the date and time. |
| `-h`, `--help` | Prints the options. |
| `-- ARGUMENTS` | Everything after `--` goes to Unity, after the arguments of the script. |

Without assembly names, Unity runs every test it finds, including the tests that come with
packages, such as the VRChat SDK. The default list is every assembly definition Unity imports under
`Assets`, plus the assemblies Unity compiles scripts without one into (`Assembly-CSharp`,
`Assembly-CSharp-firstpass`, `Assembly-CSharp-Editor` and `Assembly-CSharp-Editor-firstpass`), so
tests in `Editor` folders run too. Like Unity, it skips files and folders whose names start with a
dot, and folders whose names end with `~`. A name with no tests in it is harmless.

Arguments for Unity go after `--`, such as a build target:

```bash
./run_unity_tests.sh -- -buildTarget win64
```

The Unity manual lists them under
[Editor command line arguments](https://docs.unity3d.com/2022.3/Documentation/Manual/EditorCommandLineArguments.html).

## What it does

Each test mode starts Unity once, in batch mode, with `-runTests`. Unity writes the results of the
mode to `<mode>.xml` and its log to `<mode>.log` in the results folder. For each mode, the script
prints every test that didn't pass, with its result and message, then a count of the tests that
passed, failed, and were inconclusive or skipped.

## Exit code

- 0 when every test passed or was skipped.
- 1 when Unity reported a failed or inconclusive test, or a run that errored out, or when a mode
  wrote no results, in which case it prints the path of the log. It also exits with 1, without
  starting Unity, when it finds no project or no Unity, or can't create the results folder.
- 2 when the options are wrong, such as an unknown option or a test mode other than the three.
