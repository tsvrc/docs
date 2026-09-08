---
id: instance-module
title: InstanceModule
sidebar_position: 9
---

# InstanceModule

`Tsvrc.Editor.InstanceModule` is what finds, creates, and heals a project's single
[`Instance`](../core-concepts/instance) subclass — the type you'd otherwise need to hand-wire onto
the generated root yourself. There's no manual configuration for this one: the module scans
every loaded assembly for a non-abstract `Instance` subclass and fully owns a child object
named `"Instance"` under the scaffold root, self-recovering without any user action needed.

## Detecting the one real subclass

`DetectInstanceType` reflects across every loaded assembly, filters out anything marked
[`[TsCodegenIgnore]`](../core-concepts/attributes.md) (test doubles, most commonly), and deduplicates
by full type name — Unity's `AppDomain` can carry stale duplicate copies of the same
assembly across successive recompiles, which would otherwise make one real subclass look
ambiguous just because it was seen twice. Zero candidates or exactly one are both
unambiguous outcomes; more than one logs an error and makes `Wire()` leave whatever's
currently wired untouched entirely, since destroying a working setup because a second,
possibly-transient subclass momentarily appeared would be worse than doing nothing.

## Surviving a broken compile

The generated field and property (`_instance` / `public override Instance Instance =>
_instance;`) are always declared as the plain `Instance` base type — `GenerateCode()`'s
output never depends on which concrete subclass was detected, so a broken compile can't
corrupt the generated *code*. What a broken compile *can* corrupt is `Wire()`'s live-reflection
detection: if the AppDomain scan finds zero candidates, but `ScriptIndex`'s independent,
source-text-based scan confirms exactly one real `Instance` subclass genuinely exists in
project source, that almost always means the subclass itself just failed to compile along
with everything else. In that case (`_knownViaScriptIndexOnly`), `Wire()` deliberately does
nothing rather than destroying the real, working `"Instance"` child object and nulling the
scene field — there's no live type to re-wire it with anyway, so leaving the existing scene
state alone is the only safe option.

## Self-healing the scene object

On a clean detection, `Wire()` creates the `"Instance"` child if it doesn't exist, or
recreates its component if the existing one is the wrong type (renamed/retyped) or its
UdonSharp program asset was deleted — `UdonSharpUndo.DestroyImmediate` is required for that
teardown rather than a plain destroy, since an UdonSharp component carries a hidden backing
`UdonBehaviour` a plain destroy would orphan. This destruction is narrowly scoped: it only
ever removes a component that's either exactly the currently-detected type or some other
stale `Instance` subclass — never every `UdonSharpBehaviour` on that child indiscriminately,
so a developer's own unrelated script hand-attached to the same GameObject survives an
`Instance` retype untouched.

## Reserved name

`Instance` is reported via `ExposedFieldNames()` at `ReservedFieldNamePrecedence`
unconditionally, so a Global or Construct entry that happens to auto-derive the exact name
`"Instance"` (for example, referencing a plain GameObject literally named that) is caught by
collision detection and excluded, rather than silently producing a duplicate-member compile
error.
