---
id: running-tests-from-the-command-line
title: Run tests from the command line
sidebar_position: 8
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Run tests from the command line

[`Invoke-UnityTests.ps1`](../reference/invoke-unity-tests) on Windows and
[`run_unity_tests.sh`](../reference/run-unity-tests) on Linux run a Unity project's tests from the
command line and print only what needs your attention: the tests that didn't pass, with their
messages, and a count of the rest. They're generic scripts, independent of the kit: copy one into
any Unity project to use it there, whether or not that project has the kit.

## Steps

<Tabs groupId="os">
<TabItem value="windows" label="Windows" default>

1. Get the script: `Scripts~/Invoke-UnityTests.ps1` in the
   [kit's repository](https://github.com/tsvrc/udon-test-kit). If you installed the kit through the
   Creator Companion, it's also in `Packages/com.tsvrc.udon-test-kit/Scripts~`. A `.unitypackage`
   can't carry it.
2. Copy it into your project, such as its root folder. It finds the project by looking up from its
   own folder.
3. Close the Unity Editor. Batch mode can't open a project another Editor has open.
4. Run it from that folder, in PowerShell:

   ```powershell
   .\Invoke-UnityTests.ps1
   ```

If PowerShell refuses to run the script because of its execution policy, allow local scripts once
with `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`.

</TabItem>
<TabItem value="linux" label="Linux">

1. Get the script: `Scripts~/run_unity_tests.sh` in the
   [kit's repository](https://github.com/tsvrc/udon-test-kit), or in
   `Packages/com.tsvrc.udon-test-kit/Scripts~` of a project that has the kit installed as a package.
   A `.unitypackage` can't carry it.
2. Copy it into your project, such as its root folder, and make the copy executable with
   `chmod +x run_unity_tests.sh`. It finds the project by looking up from its own folder.
3. Close the Unity Editor. Batch mode can't open a project another Editor has open.
4. Run it from that folder, in Bash, with the Windows build target:

   ```bash
   ./run_unity_tests.sh -- -buildTarget win64
   ```

The kit needs the Windows build target on Linux. Everything after `--` goes to Unity, and in batch
mode, Unity opens a project it hasn't imported yet on the Linux build target unless
`-buildTarget` says otherwise.

</TabItem>
</Tabs>

Each script runs your project's Edit Mode tests, then its Play Mode tests, each mode in its own
batch-mode Unity process, and exits with 1 when a test failed or was inconclusive, or a run didn't
finish. That makes either one usable as a build step as it is.

## Run part of the tests

By default, each script runs the tests in every assembly definition under `Assets` and in scripts
without one, and leaves out the tests that come with packages. To run one mode:

<Tabs groupId="os">
<TabItem value="windows" label="Windows" default>

```powershell
.\Invoke-UnityTests.ps1 -TestMode PlayMode
```

</TabItem>
<TabItem value="linux" label="Linux">

```bash
./run_unity_tests.sh --test-mode PlayMode -- -buildTarget win64
```

</TabItem>
</Tabs>

To run particular test assemblies, separated with `;`:

<Tabs groupId="os">
<TabItem value="windows" label="Windows" default>

```powershell
.\Invoke-UnityTests.ps1 -AssemblyNames "MyWorld.Tests.EditMode;MyWorld.Tests.PlayMode"
```

</TabItem>
<TabItem value="linux" label="Linux">

```bash
./run_unity_tests.sh --assembly-names "MyWorld.Tests.EditMode;MyWorld.Tests.PlayMode" -- -buildTarget win64
```

</TabItem>
</Tabs>

The reference pages list every option, including where each script looks for Unity, where it
writes results, and how it passes other arguments to Unity.
