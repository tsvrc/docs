---
id: test-assembly-updater
title: TestAssemblyUpdater
sidebar_position: 14
---

# TestAssemblyUpdater

`Tsvrc.UdonTestKit.TestAssemblyUpdater` adds to the test assemblies
[`TestAssemblyCreator`](./test-assembly-creator) created the assembly definitions your world got
after they were created. Run it from
**Tools > TsVRC > Udon Test Kit > Update Test Assembly References**.

## What it changes

It finds the assemblies under `Assets` whose names end as `TestAssemblyCreator` names them:
`.Tests.EditMode`, `.Tests.PlayMode`, `.Tests.Doubles` and `.Tests.UdonDoubles`. To each, it adds
the assembly definitions of yours it doesn't reference yet, as `TestAssemblyCreator` gives them: the
ones player builds include to all four, and your Editor-only ones to the Edit Mode test assembly
only.

It adds the references after the ones an assembly definition has, and removes nothing. The rest of
each file stays as it is, so references and settings you changed by hand stay. Unity requires one
form for all the references of an assembly definition, names or GUIDs, so the added ones take the
form of those already there: with **Use GUIDs** on, it adds them by GUID.

It logs the assembly definitions it changed, or that every one already references the assembly
definitions of your world.

## From code

`TestAssemblyUpdater.Update()` does the same, and returns the paths of the assembly definitions it
changed, empty when it changed none. `TestAssemblyUpdater.MenuPath` is the path of the menu item.

## Edge cases

- Assembly definitions in packages and in the kit are left alone.
- An assembly definition you deleted stays in the references of the test assemblies until you take
  it out.
