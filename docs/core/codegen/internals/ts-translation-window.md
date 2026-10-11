---
id: ts-translation-window
title: Translation window
sidebar_position: 5
---

# Translation window

**Tsvrc > Translation** (`TsTranslationWindow`) is the authoring surface for the language
files [`TranslationModule`](../modules/translation-module) turns into generated
lookup code. It edits the same [`TsTranslationConfig`](../config/translation-config)
asset the module reads, and offers a one-click **Create Translation Config** if that asset
doesn't exist yet at its expected path.

## Usage

Open **Tsvrc > Translation**, click **Create Translation Config** if none exists yet, then
assign one `TextAsset` per language and name any translatable `TextMeshProUGUI` object in the
linked scene `_key_` to match an entry's key across every language file.

## Editing language files

Each row is a `TextAsset` slot plus a live preview of that file's `"key"` and `"label"`
fields (parsed once per asset and cached by instance ID, so repainting the window doesn't
re-run the same two regex matches on every frame; the cache is cleared when a file is
swapped out or the project changes). The window's own help text spells out the expected
shape directly: `"key"` (a stable identifier, e.g. `"en"`), `"label"` (the display name,
e.g. `"English"`), and `"entries"`, each entry either a plain string or an object with a
`"label"` (the actual translated text) and an optional `"description"` (translator notes,
never included in the generated build).

## Scene preview

Below the language list, the window shows every `TextMeshProUGUI` object in the linked scene
whose name matches the same `_key_` naming pattern and the same linked scene (see
[`TsLinkedScene`](../config/linked-scene)) `TranslationModule` scans at generate
time. Unlike the module's own scan, the count here isn't also filtered down to names that
already have a matching key in a loaded language file. It deliberately counts every
name-pattern match first, then separately flags any of them whose key doesn't appear in
*any* loaded language file. That mismatch would otherwise only surface as a name silently
failing to translate at runtime, with nothing in the console to point at why.

This target count is invalidated (not eagerly recomputed) on every scene hierarchy change,
so it stays current as you rename or add TMP objects without re-scanning the whole scene on
every single repaint.
