---
id: ts-window
title: TsWindow
sidebar_position: 2
---

import TsWindowMock from '@site/src/components/TsWindowMock';

# TsWindow

`Tsvrc.Editor.TsWindow` is **Tsvrc > Configure**: the tabbed editor window every
[module](../modules/ts-single-component-module) with a non-null `TabLabel` renders itself
into, plus an always-last "Settings" pseudo-tab. This page covers the window's own behavior:
tab management, the linked-scene picker, status reporting, and the edit-batching contract
every tab's edits go through. See [`TsPendingConfigEdit`](./ts-pending-config-edit) for how
that batching actually works, and each module's own reference page for what a specific
tab's fields mean.

## Try it

The window below is live, not a screenshot: every button does what it really does. Mock
data only, nothing here reads from or writes to a real Unity project.

<TsWindowMock />

## Tabs

Tabs come from `TsGenerator.CreateModules()`, filtered to modules with a `TabLabel`, in the
order the generator creates them. The tab list is built once in `OnEnable` and deliberately
not rebuilt every time the underlying config changes: a module instance can hold tab-only UI
state (a group tree's expand/select/search state, a foldout), and rebuilding on every
regenerate would silently reset all of that. Only the tracked `TsConfig` itself is reloaded
on a regenerate; the tab objects persist for the window's lifetime. The selected tab index
survives a domain reload via a `[SerializeField]` field: `EditorWindow` instances are
re-deserialized across a reload, but only serialized fields keep their value across it.

The Settings tab isn't a real module: it's a pseudo-module (`SettingsTabModule`) appended
last, because its content spans two different data sources (`LogModule`'s logging fields,
which live on the scene's `TsvrcLogger`, and `TsConfig`'s tree-shaking fields) that don't
belong to any single registered module.

## Apply / Discard

Every tab's edits are batched behind an explicit Apply/Discard step rather than triggering a
real regenerate on every single property change. That batching is the entire reason
[`TsPendingConfigEdit`](./ts-pending-config-edit) exists. `TsWindow` participates in Unity's
own "unsaved changes" contract (`hasUnsavedChanges`, `SaveChanges`, `DiscardChanges`): it
decorates the window's title/tab and blocks it from closing, including on an editor quit,
until you explicitly apply or discard. `TsWindow` tracks two independent pending-edit sets
at once, the active tab's `TsConfig` edits and the Settings tab's separate `TsvrcLogger`
edits, both folded into one shared "you have unapplied changes" footer and one shared
`hasUnsavedChanges` flag.

Beyond the window-close path, switching the linked scene (or picking a different scene to
link) also risks discarding an in-progress edit silently. `ResolvePendingChangesBeforeSwitch`
guards that specific action with its own Apply/Cancel/Discard dialog, since
`hasUnsavedChanges`'s built-in protection only covers the window actually closing.

## Status reporting

Five independent status boxes render above the tabs on every `OnGUI` pass, each answering a
different question, all backed by a pure, directly-unit-testable `Determine*` method so the
exact wording and triggering condition can be tested without driving real `OnGUI`:

- **Linked scene** — whether a scene is linked at all, and if so, whether it's currently
  open, was deleted outright, or the link itself was lost (real generated content exists on
  disk with nothing linked to it, a strong hint `TsLinkedSceneConfig.asset` was deleted).
- **Setup status** — not yet set up, waiting on a pending bootstrap's recompile, in play
  mode (regeneration is disabled there), or set up but unlinked.
- **Missing builtin config** — `TsBuiltinConfig.asset` itself is gone (a bad merge or
  submodule update can lose this for a whole team at once).
- **Field name collisions** — names dropped from the last regenerate due to a cross-module
  naming conflict, naming exactly which ones.
- **Run warnings** — a short summary (capped, with a "see Console" pointer past the cap) of
  anything else the last regenerate pass logged.

A sixth box, the **tree-shaking summary** (what got excluded as unused, and what's in its
one-pass grace period), isn't part of this always-visible group. It only renders inside the
Settings tab's own content, next to the tree-shaking toggle it reports on, drawn as its own
`Info`-level box per condition (this is the feature working as intended, not a problem), so
"gone, bring it back" and "still here for now" read as distinct signals.

## Initialize Tsvrc / Force Regenerate

The same button, `TsGenerator.ManualGenerate()`, appears under two labels depending on
state: "Initialize Tsvrc" the first time, "Force Regenerate" after a `TsConfig` already
exists. A first-time setup and a maintenance regenerate are different mental models for the
person clicking it, even though the underlying action is identical. See
[`TsGenerator`](../internals/ts-generator) for what that action actually does.
