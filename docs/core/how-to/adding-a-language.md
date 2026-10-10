---
id: adding-a-language
title: Add another language and switch at runtime
sidebar_position: 16
---

# Add another language and switch at runtime

How to localize your world's UI text and let players switch languages while it's
running, using **Tsvrc > Translation** and the generated
[`TranslationModule`](../codegen/modules/translation-module) API.

## Steps

1. Open **Tsvrc > Translation** and click **Create Translation Config** if none exists
   yet. Assign one `TextAsset` per language, each a JSON file shaped like:

   ```json
   {
     "key": "fr",
     "label": "French",
     "entries": {
       "menu_play": "Jouer",
       "players_remaining": "{value} joueurs restants"
     }
   }
   ```

   The generated `Language` enum member's name is derived from `"label"`, sanitized into
   a valid identifier, so `"French"` becomes `Language.French`. A label with characters
   outside `A-Za-z0-9` (an accented name, a language's own native script) sanitizes into
   whatever identifier those characters actually produce; pick a plain ASCII label if you
   want a predictable enum member name to reference from code.

2. Name every translatable `TextMeshProUGUI` object with a single underscore on each
   side, matching an entry key exactly (`_menu_play_`, `_players_remaining_`). No
   component or attribute marks it as translatable, just the name.
3. Regenerate. Switch languages and read a translation directly from code:

   ```csharp
   public class LanguageSelector : TsBehaviour
   {
       [SerializeField] private TextMeshProUGUI _remainingText;

       public void SwitchToFrench() => _ts.SetLanguage(Language.French);

       public void ShowRemaining(int count) =>
           _remainingText.text = _ts.Translate("players_remaining", count.ToString());
   }
   ```

   Every `_menu_play_`/`_players_remaining_`-named text object updates automatically the
   moment `SetLanguage` runs. Nothing else to wire for text that's just named correctly.

4. If a script needs to react to a language switch itself, not just have its own text
   objects update, subscribe to it:

   ```csharp
   protected override void TsStart()
   {
       _ts.SubscribeLanguageChanged(this, nameof(_OnLanguageChanged));
   }

   public void _OnLanguageChanged() => RefreshCustomWidgets();
   ```

## Checking for missing translations

Open **Tsvrc > Translation** and look at the scene preview list below the language
files. It flags any `_key_`-named text object whose key doesn't appear in a loaded
language file, so a missing entry surfaces there instead of only failing silently at
runtime (a missing key just falls back to showing the raw key itself, never an empty
string or an exception).

## Why this shape

See [`TranslationModule`'s reference page](../codegen/modules/translation-module) for
exactly how a text object is discovered as a translation target, why the batch
application spreads across multiple frames instead of updating everything at once, and
the required `"key"`/`"label"`/`"entries"` shape a language file must have.
