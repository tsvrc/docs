---
id: testing-scripts-without-an-assembly-definition
title: Test scripts that have no assembly definition
sidebar_position: 10
---

# Test scripts that have no assembly definition

Scripts without an assembly definition compile into `Assembly-CSharp`, which no assembly
definition can reference, including the test assemblies
[`TestAssemblyCreator`](../reference/test-assembly-creator) creates. Creating them logs a warning
when your project has such scripts.

## Edit Mode tests

Put the tests in any folder named `Editor` that has no assembly definition. Unity compiles them
into `Assembly-CSharp-Editor`, which can use your scripts, NUnit and the kit without any
references set up. Unity's Test Runner finds them there, and so does
[`Invoke-UnityTests.ps1`](../reference/invoke-unity-tests).

## Play Mode tests

Play Mode tests need an assembly definition of their own, so the scripts they test need one too:

1. Create an assembly definition in the folder that holds your scripts (**Assets > Create >
   Assembly Definition**). It covers the scripts in that folder and its subfolders.
2. Give it the references your scripts need, such as `UdonSharp.Runtime`, `VRC.SDKBase` and
   `VRC.SDK3`.
3. Create a U# assembly definition next to it (**Assets > Create > U# Assembly Definition**) and
   set its source assembly to the one you created, so UdonSharp keeps compiling those scripts for
   Udon.
4. Add its name to the references of your Play Mode test assembly, or delete the test assemblies
   and create them again, which picks it up.
