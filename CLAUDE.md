# TsVRC docs

This repo is the documentation site for the `tsvrc` GitHub org (Docusaurus, TypeScript).
It documents TsVRC and any other project under the org, namespaced by folder — not one
docs repo per project.

## Structure

- `docs/<project>/` — one folder per project (e.g. `docs/tsvrc/`). A new project gets a
  new folder here, not a new repo.
- Content follows the Diátaxis framework (tutorial / how-to / reference / explanation).
  Read `.claude/rules/doc-structure.md` before adding or restructuring a page.
- Writing style — grammar, tone, avoiding AI-sounding prose, avoiding noise — is defined in
  `.claude/rules/writing-style.md`. Read it before writing or editing any `.md`/`.mdx` file.

## Internationalization (i18n)

This site is set up for `en` (default) and `es`, but only `en` has real content right
now — `es` currently covers only the two marketing pages (`src/pages/index.tsx`,
`src/pages/framework.tsx`) plus one worked-example doc page (see below), not the rest of
the docs.

- **Docs content** (`docs/<project>/`): stays English-only, unversioned, exactly where
  it is. This is deliberate, not a gap to fill by default — per Docusaurus's own i18n
  convention, the default locale's docs live directly under `docs/`, and a
  translation is added later as a parallel tree at
  `i18n/<locale>/docusaurus-plugin-content-docs/current/<project>/`, mirroring the
  same relative paths and filenames. Adding a language never touches the English
  files. Sidebar category labels (`_category_.json`) translate the same way, via
  `i18n/<locale>/docusaurus-plugin-content-docs/current.json` — currently absent on
  purpose, so the docs sidebar renders in English for every locale until real
  translations exist (a half-translated sidebar over English content would be worse
  than an English one).
- **The two marketing pages**: translated today via `@docusaurus/Translate`/
  `translate()` in the component source, with per-locale strings in
  `i18n/<locale>/code.json`. Adding a language means running
  `docusaurus write-translations --locale <code>` and filling in that locale's
  `code.json` — the component code itself doesn't change.
- **Theme chrome** (pagination, admonition labels, sidebar buttons, etc.): never
  override these in this site's own `code.json`. Docusaurus ships its own
  professionally translated defaults per locale; only `homepage.*`/`framework.*` keys
  belong in this site's `code.json`.
- Adding a third locale: add it to `i18n.locales` (and `localeConfigs`) in
  `docusaurus.config.ts`, run `write-translations`, translate `code.json` plus
  `docusaurus-theme-classic/{navbar,footer}.json`. Docs stay English until someone
  actually translates them into the new `i18n/<locale>/docusaurus-plugin-content-docs/current/`
  tree.
- **Translation quality: never translate literally.** When writing or updating any
  `code.json` (or any other translated string) for `es` or any future locale, use the
  term a professional in that field, in that language, actually uses — not a word-for-word
  rendering of the English. Before translating a technical or domain term (Unity/UdonSharp/
  VRChat/GitHub concepts especially), check how it's rendered in that language's official or
  most-trusted sources (e.g. Unity's own localized manual at `docs.unity3d.com/es/...`, VRChat's
  Spanish-speaking creator community, GitHub's own glossary/docs) rather than guessing or
  machine-translating. Two patterns come up constantly and cut opposite ways, so check per
  term instead of assuming:
  - **Many technical/proper nouns are conventionally left in English**, even in otherwise
    fully translated prose — e.g. in Spanish, Unity's own docs never translate `GameObject`,
    `Inspector`, `Prefab`, `Script`, or `Play Mode`; GitHub's Spanish glossary keeps `issue`
    and `pull request` as loanwords (GitHub's own UI ships English-only, so the loanword is
    literally what a user clicks). This repo's own code identifiers (`_ts.Memory`, `TsStart`,
    `TsBehaviour`, class/property names inside example code or referring to it) are never
    translated either — including inside descriptive text, e.g. `_ts.Name` must stay
    `_ts.Name`, not become `_ts.Nombre`.
  - **Other English phrasing has a real idiomatic equivalent that isn't the literal
    word-for-word choice** — e.g. "extends"/inheritance reads more naturally in Spanish as
    "hereda de" than a calque like "extiende"; Unity's Spanish manual calls `Instantiate()`
    "instanciar", not a generic "generar/crear". Prefer the term the target community
    actually uses in casual technical speech, not a dictionary's first hit.
  - Also double-check direction/meaning survived translation, not just word choice — a
    literal-sounding translation can silently invert an "A extends B" relationship if you're
    not reading the translated sentence back for what it actually asserts.
  - A word can be the "correct" dictionary or OS-level technical term and still not be what
    this content's actual audience says day to day — e.g. "arranque" is standard Spanish for
    booting an OS, but reads stiffer than "inicio"/"iniciar" for a script or behaviour starting
    up in casual creator-facing prose. When a general web search and a native speaker's ear
    disagree, defer to the native speaker: ask or take their correction over the search result.
- **Worked example**: `docs/tsvrc/intro.md` has a real Spanish translation at
  `i18n/es/docusaurus-plugin-content-docs/current/tsvrc/intro.md` — same filename,
  same relative path, translated content. Copy that pattern for any other doc page.
  Verified in-browser: the translated page renders correctly, links from it to
  still-untranslated pages fall back to English cleanly under the same `/es/` prefix,
  and cross-page anchor links keep working even after a heading's text changes
  between languages (see the `{/* #id */}` note below).
- **Headings that other pages link to by anchor** (e.g. `/docs/tsvrc/intro#this-site`,
  linked from the homepage) need an explicit, language-stable id, or translating the
  heading text breaks the anchor. Docusaurus's MDX v3 syntax for this is a comment,
  not `{#id}` (that's the old, now-invalid MDX v1/v2 form and fails the build):
  `## This site {/* #this-site */}`. Keep the same id across every language's version
  of that heading.

## Commands

- `npm start` — dev server at http://localhost:3000, hot-reloads content but not
  `docusaurus.config.ts` (restart the server after config changes).
- `npm run build` — production build. Run this before calling a doc change done;
  `onBrokenLinks: 'throw'` means a broken link fails the build.

## Cross-repo: tsvrc/tsvrc-core and tsvrc/docs

This repo documents code that lives in the separate `tsvrc/tsvrc-core` repo. The two are not
wired together technically — no submodule, no build-time fetch (see below for why). Nothing
keeps them in sync automatically:

- Changed public API, behavior, or the package description in `tsvrc/tsvrc-core`? Check whether
  `docs/tsvrc/` needs a matching update.
- Changed something in `docs/tsvrc/`? Check it still matches what `tsvrc/tsvrc-core` actually
  does before publishing.

A global hook flags this when either repo's docs-relevant files change. It's a nudge to go
check, not proof the two are actually in sync.

## Why there's no cross-repo build wiring

We evaluated pulling `tsvrc/tsvrc-core`'s docs into this site via a git submodule at build time
and rejected it. Surveying large community projects — Kubernetes, React, Vue, Python,
Node.js, Docker — shows the dominant patterns are docs-in-the-code-repo (single product) or
a fully self-contained docs repo, and for multi-product orgs, one consolidated repo
namespaced by project (Docker moved to this after abandoning per-product federation). None
of them merge separate repos into one build. Keep this repo self-contained unless a project
genuinely outgrows it.
