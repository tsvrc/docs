---
id: translation-module
title: TranslationModule
sidebar_position: 10
---

# TranslationModule

`Tsvrc.Editor.TranslationModule` turns the JSON language files registered in
[`TsTranslationConfig`](../config/translation-config) into generated `Language`
enum values, a `SetLanguage`/`Translate` API, and the batched text-application logic that
actually updates `TextMeshProUGUI` targets in the scene. See [Add another language and
switch at runtime](../../how-to/adding-a-language) for a task-oriented walkthrough.

## Usage

Name a `TextMeshProUGUI` object `_greeting_`, give a language file a matching `"_greeting_"`
entry, and it updates automatically on every language switch, nothing to wire by hand. From
code, switch languages and pull a translation directly:

```csharp
_ts.SetLanguage(Language.French);
_ts.LobbyStatusText.text = _ts.Translate("_players_remaining_", remaining.ToString());
```

## Language file format

Each language file is a JSON object with `"key"` (a stable identifier for the language,
independent of its display label), `"label"` (the human-readable name used to derive the
generated `Language` enum member), and `"entries"` (a flat map of translation key → either a
plain string or an object with its own `"label"` field). A file missing any of the three
top-level fields is rejected with a logged error naming which field is missing, and
contributes nothing to that pass's generated output rather than partially generating with
missing data.

## How translation targets are discovered

A `TextMeshProUGUI` component becomes a translation target purely by its **GameObject's
name** matching a specific pattern, a single underscore on each side, such as `_greeting_`,
*and* that exact name (underscores included) appearing as a key in at least one loaded
language file's `entries`. There's no component-level marker or attribute: name
the text object `_greeting_`, give a language file an `"_greeting_"` entry, and it's picked
up automatically. Re-scanned whenever the scene hierarchy changes or generated files settle,
so renaming a text object in or out of the naming pattern picks up or drops it as a target
on the next pass with no manual re-registration needed.

## Generated API

- **`SetLanguage(Language lang)`** — switches the active key/value arrays and immediately
  starts a batched re-application pass over every translation target, then notifies every
  listener registered via `SubscribeLanguageChanged`.
- **`SubscribeLanguageChanged(UdonSharpBehaviour listener, string callback)`** — registers
  `listener` to receive `SendCustomEvent(callback)` on every future `SetLanguage` call, its
  own small generated pub/sub separate from the base `TsvrcBehaviour`'s `TsSubscribe`/
  `TsEmit`. Subscribing the same listener/callback pair twice is a no-op rather than a
  duplicate delivery.
- **`Translate(string key)`** / **`Translate(string key, string param)`** — linear-scans the
  active language's keys for an exact match, returning the untranslated key itself as a
  fallback when nothing matches (so a missing translation degrades to showing the raw key
  rather than an empty string or an exception) The `param` overload additionally substitutes
  a `{value}` placeholder in the matched string.
- **`_TsApplyTranslationBatch()`** — applies translated text to scene targets in fixed-size
  batches (20 per frame) via `SendCustomEventDelayedFrames`, rather than all at once, so
  switching languages with many on-screen text elements doesn't spike a single frame.

## Generated code changes when targets do, not just when language files do

`AfterFilesStable`/`OnSceneHierarchyChanged` both re-scan for matching `TextMeshProUGUI`
targets and compare against the last known set (`SyncEffectiveKeys`). A scene edit that adds
or renames a matching text object triggers a regenerate on its own, independent of whether
any language file itself changed, since `Wire()`'s `_translationTargets` array needs to
include it.
