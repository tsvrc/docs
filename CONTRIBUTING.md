# Contributing to TsVRC docs

## Setup

- **Node 20+** (see `engines` in `package.json`).
- `npm install`, then `npm start` for a hot-reloading dev server at
  `http://localhost:3000`. Config changes (`docusaurus.config.ts`) need a server restart,
  content changes don't.
- `npm run build` before calling any doc change done. `onBrokenLinks: 'throw'` means a
  broken link fails the build, so this catches mistakes `npm start` won't.

## Writing docs

This site follows the [Diátaxis framework](https://diataxis.fr/) (tutorial / how-to /
reference / explanation) and a house writing style aimed at not reading like AI-generated
prose. Read [STYLE_GUIDE.md](STYLE_GUIDE.md) before writing or editing any page: which of
the four categories a page belongs to, section conventions, linking instead of
duplicating, words/phrases to avoid, sentence shape, formatting rules.

## Multi-project layout

Each project under the `tsvrc` org gets its own `docs/<project>/` folder here rather than
its own docs repo. Adding docs for a new project means adding a folder here and a
matching top-level category in `sidebars.ts`, not creating a new repo. Every project shares
one sidebar, so a category whose label another project already uses, such as "Reference",
needs a unique `key`; without one, the Spanish build fails on a duplicate translation key.
`docs/udon-test-kit/` is set up this way.

A project's docs stand on their own. When one project depends on another, as TsVRC does on
Udon Test Kit, the dependent project's pages link to the other's where a reader needs it, and
the project depended on never mentions its consumers.

## Adding a translation

Docs content stays English-only and unversioned under `docs/<project>/`. A translation
lives in a parallel tree at
`i18n/<locale>/docusaurus-plugin-content-docs/current/<project>/`, mirroring the same
relative paths and filenames; adding a language never touches the English files. See
`docs/tsvrc/intro.md` and its Spanish counterpart for a worked example to copy.
`src/pages/` translates differently: via `@docusaurus/Translate` in the component source,
with strings in `i18n/<locale>/code.json`.

A heading another page links to by anchor needs a stable id that survives translation,
since translating the heading text changes the anchor. Docusaurus's MDX v3 syntax for this
is a comment, not `{#id}`: `## Play Mode tests {/* #play-mode-tests */}`. Sidebar category
labels live in `sidebars.ts` itself, not a translatable file, so they render in English for
every locale regardless of translated content underneath. Don't override Docusaurus's
theme chrome (pagination, admonition labels, sidebar buttons) in this site's own
`code.json`; it ships its own translated defaults per locale.

Before translating a technical term, check how the target language's own community or
official docs (Unity's localized manual, GitHub's glossary, VRChat's community) actually
render it rather than translating literally. Some terms stay in English even in translated
prose, others have a real idiomatic equivalent that isn't the literal word-for-word choice.
This repo's own code identifiers (`_ts.Memory`, `TsStart`) are never translated, including
inside prose.

## Submitting a pull request

1. Sign off every commit (`git commit -s`) per the [Developer Certificate of
   Origin](https://developercertificate.org/). This certifies you wrote the change, or
   otherwise have the right to submit it under this project's license (CC BY 4.0 for
   docs content, see [README.md](README.md#license) for the code/content split).
2. If AI tooling helped write part of your change, say so in the PR description, briefly.
   You're still fully responsible for the contribution, read, understand, and check it
   renders correctly before submitting, the same as if you'd written it yourself.
3. Fill in the PR template's checklist and open the PR. Community conduct is covered by
   the [org-wide Code of Conduct](https://github.com/tsvrc/.github/blob/main/CODE_OF_CONDUCT.md).

## Reporting a security vulnerability

Don't open a public issue for this. See [SECURITY.md](SECURITY.md).
