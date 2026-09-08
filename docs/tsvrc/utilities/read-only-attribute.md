---
id: read-only-attribute
title: ReadOnlyAttribute
sidebar_position: 1
---

# ReadOnlyAttribute

`Tsvrc.Utils.ReadOnlyAttribute` marks a serialized field as read-only in the Unity
Inspector.

```csharp
[ReadOnly]
public int computedAtRuntime;
```

It's a plain `PropertyAttribute` with no members and no behavior on its own — the actual
effect comes from its paired `ReadOnlyDrawer` (in the Editor assembly), which disables the
GUI control while drawing the field so it renders grayed out. This only stops accidental
edits in the Inspector; it doesn't make the field read-only from code, and doesn't affect
serialization. Use it to signal "this value is managed elsewhere" — most commonly a field
the codegen generator itself writes, where hand-editing it in the Inspector would just be
overwritten on the next regeneration. `WirePoolAttribute` uses the same
disable-while-drawing technique for the same reason.
