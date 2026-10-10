---
id: running-tests-from-the-command-line
title: Run tests from the command line
sidebar_position: 8
---

# Run tests from the command line

[`Invoke-UnityTests.ps1`](../reference/invoke-unity-tests) runs a Unity project's tests from
PowerShell on Windows and prints only what needs your attention: the tests that didn't pass, with
their messages, and a count of the rest. It's a generic script, independent of the kit: copy it
into any Unity project to use it there, whether or not that project has the kit.

## Steps

1. Get the script: `Scripts~/Invoke-UnityTests.ps1` in the
   [kit's repository](https://github.com/tsvrc/udon-test-kit). If you installed the kit through the
   Creator Companion, it's also in `Packages/com.tsvrc.udon-test-kit/Scripts~`. A `.unitypackage`
   can't carry it.
2. Copy it into your project, such as its root folder. It finds the project by looking up from its
   own folder.
3. Close the Unity Editor. Batch mode can't open a project another Editor has open.
4. Run it from that folder:

   ```powershell
   .\Invoke-UnityTests.ps1
   ```

It runs your project's Edit Mode tests, then its Play Mode tests, each in its own batch-mode Unity
process, and exits with 1 when a test failed or was inconclusive, or a run didn't finish. That makes
it usable as a build step as it is.

## Run part of the tests

Run one mode:

```powershell
.\Invoke-UnityTests.ps1 -TestMode PlayMode
```

Run particular test assemblies, separated with `;`:

```powershell
.\Invoke-UnityTests.ps1 -AssemblyNames "MyWorld.Tests.EditMode;MyWorld.Tests.PlayMode"
```

By default, the script runs the tests in every assembly definition under `Assets` and in scripts
without one, and leaves out the tests that come with packages. The
[reference page](../reference/invoke-unity-tests) lists every option, including where it looks for
Unity and where it writes results.

If PowerShell refuses to run the script because of its execution policy, allow local scripts once
with `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`.
