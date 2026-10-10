---
id: translation-config
title: TsTranslationConfig
sidebar_position: 6
---

# TsTranslationConfig

`Tsvrc.Editor.TsTranslationConfig` is a small `ScriptableObject` holding the list of
language files (`LanguageFiles`, a `TextAsset[]`) that `TranslationModule` and the
Translation editor window read from. Each referenced file is expected to be a JSON document
containing a `"key"`, a `"label"`, and an `"entries"` field: one file per language. See
[`TranslationModule`](../modules/translation-module) for how the generator actually turns
these into generated lookup code, and the
[Translation window](../internals/ts-translation-window) for the authoring tool
built around this same file format.

## Usage

A language file for French, referenced from a `TsTranslationConfig` asset's `LanguageFiles`
array:

```json
{
  "key": "fr",
  "label": "Français",
  "entries": {
    "menu.play": "Jouer",
    "menu.settings": "Paramètres"
  }
}
```

An entry's value can also be an object with its own `"label"` field instead of a plain
string, for entries that need extra per-language metadata later.
