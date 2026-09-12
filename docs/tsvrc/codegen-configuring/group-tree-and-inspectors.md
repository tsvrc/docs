---
id: group-tree-and-inspectors
title: Group tree, inspectors, and shared UI helpers
sidebar_position: 5
---

# Group tree, inspectors, and shared UI helpers

The rest of the `Editor/Configure` folder: the master-detail widget every grouped tab
(Globals, Pool, Constructs, Factories) is actually built from, the custom inspectors that
redirect a curious Hierarchy click back to [Tsvrc > Configure](./ts-window), and the small
shared drawing helpers used across every Tsvrc editor window.

## TsGroupTreeGUI

`Tsvrc.Editor.TsGroupTreeGUI` renders one `TsGroup[]`/`TsGroupedEntry[]` pair as a
master-detail view: a searchable `TreeView` of nested groups on the left, the selected
group's direct entries on the right (row rendering delegated to
[`ObjectListGUI`](#objectlistgui) below). Every grouped module's tab is this same widget
with different parameters. `memberPrefix`/`memberSuffix` control whether a live member-name
preview is shown at all (`"_ts."` for Globals, `"Create"`/`"(parent)"` for Factories,
neither for Pool or Constructs, since neither generates a name at all). `prefixRespectsToggle`
mirrors [`BuildGroupPrefix`](../codegen-internals/ts-module)'s own `respectToggle` parameter:
Factory always prefixes regardless of a group's `IncludeInName`, Global respects it
per-group.

Its `State` class holds purely UI-local state (tree expansion, selection, search text,
pagination) — never written back to any config asset — persisted across a domain reload via
`SessionState`, keyed by a combination of the target object's type name and the property
name being drawn, specifically so `TsWindow`'s `TsConfig`-backed trees and
`TsBuiltinConfigInspector`'s `TsBuiltinConfig`-backed trees (which share property names like
`"GlobalGroups"`) never collide on the same session key.

`Draw` returns whether a drag-and-drop reparent action already flushed its own nested
`ApplyModifiedProperties()` call during this draw — callers must fold that into their own
"did anything change" tracking, since a raw `SerializedProperty` write never sets
`GUI.changed` on its own, so it would otherwise go undetected by the caller's own
`EditorGUI.EndChangeCheck()`.

## ObjectListGUI

`Tsvrc.Editor.ObjectListGUI` supplies the actual per-row rendering `TsGroupTreeGUI` calls
into: a delete button, and per-row hint text covering three cases a bare `PropertyField`
can't communicate on its own — an empty slot (something used to be assigned here and was
probably deleted), a scene-instance reference where only a persisted prefab asset is valid
(the Pool and Factory tabs, both drawn with `assetsOnly: true`), and a type resolved only via
`TsModule.TryResolveObjectType`'s compile-broken fallback (shown with a note that the compile
is currently broken, since Unity's own `PropertyField` can't display a component's real type
while nothing compiles).

## The three "managed by Configure" inspectors

`TsRootInspector`, `TsConfigInspector`, and `TsBuiltinConfigInspector` all exist for the
same reason: someone can select the generated root, the `TsConfig` object, or the shared
builtin config asset directly in the Hierarchy or Project window without knowing
**Tsvrc > Configure** exists at all, and a bare default inspector would give no hint that a
friendlier, purpose-built UI is what they actually want.

- **`TsRootInspector`** shows a banner, then falls through to `DrawDefaultInspector()` —
  the generated root's fields are meant to be *read*, occasionally, not edited by hand.
- **`TsConfigInspector`** shows a banner and draws **nothing else at all** — every field on
  `TsConfig` is only ever meant to be edited through the Configure window's Apply/Discard
  batching, so exposing raw field editing here would bypass that guarantee entirely.
- **`TsBuiltinConfigInspector`** is the one real exception: `TsBuiltinConfig` has no
  dedicated window of its own, so this inspector *is* its actual editing surface — drawing
  the same `TsGroupTreeGUI` widget Configure uses, with its own
  [`TsPendingConfigEdit`](./ts-pending-config-edit) instance for the same Apply/Discard
  consistency, even though nothing watches this particular asset for automatic regeneration
  the way `TsConfig` is watched.

## Shared helpers: TsEditorGUI and TsAbout

`TsEditorGUI` is a small set of drawing helpers shared by every Tsvrc editor window
(Configure, the Translation window, the Mesh Combiner window) so they present one consistent
look: `DrawStatusBox` (a `HelpBox` plus consistent spacing), `PrimaryButton` (a button that
can be disabled with an explanatory tooltip instead of silently doing nothing when clicked),
and `DrawManagedByConfigureBanner` (the banner the three inspectors above all share, with a
button that opens Configure directly via `EditorApplication.ExecuteMenuItem`).

`TsAbout` backs the **Tsvrc > Documentation** and **Tsvrc > About** menu items — the latter
reads `package.json` directly off disk and shows its name, version, and description, so
someone reporting a bug doesn't have to dig through the Package Manager UI or open the raw
file themselves to find the version they're running.
