---
id: testing-scripts-without-an-assembly-definition
title: Test scripts that have no assembly definition
sidebar_position: 14
---

# Test scripts that have no assembly definition

Scripts without an assembly definition compile into `Assembly-CSharp`, or into
`Assembly-CSharp-firstpass` when they're in a top-level `Plugins` or `Standard Assets` folder
(the Unity manual on [script compilation order](https://docs.unity3d.com/2022.3/Documentation/Manual/ScriptCompileOrderFolders.html)).
The [Unity manual](https://docs.unity3d.com/2022.3/Documentation/Manual/ScriptCompilationAssemblyDefinitionFiles.html)
says: "Classes in assemblies created with an Assembly Definition cannot use types defined in the
predefined assemblies." That includes the test assemblies
[`TestAssemblyCreator`](../reference/test-assembly-creator) creates, so creating them logs a
warning when your project has such scripts, other than the utility scripts UdonSharp copies into
`Assets/UdonSharp`.

## Edit Mode tests

Put the tests in any folder named `Editor` that has no assembly definition and isn't inside a
top-level `Plugins` or `Standard Assets` folder. Unity compiles them into `Assembly-CSharp-Editor`,
which can use your scripts, NUnit and the kit without any references set up. The Unity Test Runner
finds them there, and so do the scripts that
[run tests from the command line](./running-tests-from-the-command-line).

## Play Mode tests

Play Mode tests need an assembly definition of their own, so the scripts they test need one too:

1. Create an assembly definition in the folder that holds your scripts (**Assets > Create >
   Assembly Definition**). It covers the scripts in that folder and its subfolders.
2. Give it the references your scripts need, such as `UdonSharp.Runtime`, `VRC.SDKBase` and
   `VRC.SDK3`.
3. Create a U# assembly definition next to it (**Assets > Create > U# Assembly Definition**) and
   set its source assembly to the one you created, so UdonSharp keeps compiling those scripts for
   Udon.
4. Run **Tools > TsVRC > Udon Test Kit > Update Test Assembly References**, which adds it to the
   references of your test assemblies.
