---
id: log-module
title: LogModule
sidebar_position: 2
---

# LogModule

`Tsvrc.Editor.LogModule` generates the `_log` field, the `Log` property override, and the
`_TsLogStart()` startup call that wire a scene [`TsvrcLogger`](../../utilities/tsvrc-logger)
into the generated root. It's a thin subclass of
[`TsSingleComponentModule`](./ts-single-component-module), which does essentially all the
real work. See that page for the shared mechanics (usage detection, self-healing scene
object, tree-shaking).

## Usage

A script never touches the generated `_log` field directly: call the wrapper methods
`TsvrcBehaviour` already gives every behaviour:

```csharp
LogInfo("Round started");
LogWarning("Slot already occupied, skipping");
```

## What's specific to LogModule

- **Extra usage detection.** A script rarely writes `_ts.Log` directly: it calls
  `TsvrcBehaviour.LogInfo`/`LogWarning`/`LogError`, which reach the logger indirectly. Those
  wrapper calls never textually mention `_ts.Log`, so `TsSingleComponentModule`'s base
  member-access check alone would miss the single most common way logging actually gets
  used. `LogModule` reports those three method names as additional usage signatures so
  tree-shaking doesn't wrongly conclude an actively-used logger is dead.
- **No standalone Configure tab.** Logging settings are rendered as a section inside the
  Settings tab rather than getting their own top-level tab. `FindLogger`,
  `DetermineNotFoundMessage`, and `DrawFields` exist specifically to let that host tab own
  the `TsvrcLogger` component's `SerializedObject` lifecycle and batch its edits through the
  same Apply/Discard flow every other tab uses, rather than `LogModule` managing its own.
