---
id: ts-pending-config-edit
title: TsPendingConfigEdit
sidebar_position: 3
---

# TsPendingConfigEdit

`Tsvrc.Editor.TsPendingConfigEdit` is the batching primitive behind every Apply/Discard
button in TsVRC's editor UI. [`TsWindow`](./ts-window) owns one per `TsConfig` it edits
(plus a second one for the Settings tab's `TsvrcLogger` fields), and
`TsBuiltinConfigInspector` owns one for whichever `TsBuiltinConfig` asset is selected. One
instance tracks edits to exactly one target object.

## Why edits need batching at all

Without this, every `SerializedObject.ApplyModifiedProperties()` call, meaning every single
field edit including one keystroke into a name field, would immediately trigger a real
regenerate pass through `TsGenerator`'s own `Undo.postprocessModifications` watch. Typing a
ten-character name would fire ten regenerate passes. `TsPendingConfigEdit` suppresses
`TsGenerator`'s automatic triggers for the duration of an in-progress edit and only lets the
accumulated changes trigger one real regenerate when you explicitly click Apply.

## The baseline

`BeginTracking(target)` rebaselines only when the tracked object's identity actually
changes (a different `TsConfig` found, a different `TsBuiltinConfig` selected), not on every
`OnGUI` call. It snapshots the target twice, for two different purposes: a JSON snapshot
(`EditorJsonUtility.ToJson`) used purely to cheaply detect *whether* anything changed, and a
full object clone (via `EditorUtility.CopySerialized` onto a hidden, same-type instance)
used to actually *restore* the target on Discard. The JSON snapshot alone isn't enough to
discard from: `EditorJsonUtility.FromJsonOverwrite` doesn't reliably round-trip
`UnityEngine.Object` references, a real bug this design was built around fixing. The hidden
clone lives on a `HideAndDontSave` GameObject for a `Component` target (which needs a
GameObject to live on at all) or as a bare `ScriptableObject` instance otherwise.

## The per-frame contract

Three calls, in order, once per `OnGUI` pass:

1. **`BeginFrame()`** — arms suppression proactively, before any edit could happen this
   frame. This matters because some UI code (`TsGroupTreeGUI`'s drag-and-drop reparenting)
   calls `ApplyModifiedProperties()` itself, mid-draw, ahead of the caller's own outer call,
   so suppression has to already be active by then.
2. *(the tab draws its fields, and the caller calls `SerializedObject.ApplyModifiedProperties()`
   plus checks `EditorGUI.EndChangeCheck()`)*
3. **`NotifyAppliedToSerializedObject(anyChangesApplied)`** — only re-diffs the target
   against the baseline JSON when `anyChangesApplied` is true. Running a full JSON diff on
   every single `OnGUI` event, including pure navigation events like scrolling where nothing
   changed, measurably degraded scroll smoothness on a config with a non-trivial entry
   count, hence the gate. Releasing suppression isn't gated the same way, though: it's keyed
   directly off whether pending changes still exist, so a window that's simply open with no
   edits ever made doesn't hold suppression forever after its first draw.

## Apply and Discard

`Apply()` ends suppression, explicitly schedules exactly one regenerate
(`TsGenerator.ScheduleRerun()`), then rebaselines against the now-applied state, both the
JSON snapshot and the hidden clone. `Discard(so)` does the opposite: it copies the hidden
baseline clone back onto the live target (never touching the network/generator at all), then
calls `so.Update()` so the `SerializedObject` the UI is drawing from reflects the reverted
state immediately. A discarded edit never reaches `ScheduleRerun()`.

## Cleanup timing

`Cleanup()` (called from `OnDestroy`, deliberately not `OnDisable`) only releases the hidden
baseline clone and any held suppression scope. It never has data to lose by the time it
runs, since `OnDisable` also fires around an ordinary domain reload, where cleaning up a
pending edit would be wrong because the user hasn't decided anything yet, while `OnDestroy`
only fires once the window or inspector is actually closing for good, by which point Unity's
own save-changes dialog has already forced a real Apply or Discard decision.
