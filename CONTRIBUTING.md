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
prose. Read these before writing or editing any page:

- [`.claude/rules/doc-structure.md`](.claude/rules/doc-structure.md): which of the four
  categories a page belongs to, section conventions, linking instead of duplicating.
- [`.claude/rules/writing-style.md`](.claude/rules/writing-style.md): words/phrases to
  avoid, sentence shape, formatting rules.

Despite the `.claude/` path, both are written for any contributor, human or AI-assisted,
not just for Claude specifically.

## Multi-project layout

Each project under the `tsvrc` org gets its own `docs/<project>/` folder here rather than
its own docs repo (see the root [`CLAUDE.md`](CLAUDE.md) for why). Adding docs for a new
project means adding a folder here and a matching top-level category in `sidebars.ts`,
not creating a new repo.

## Adding a translation

Docs content stays English-only and unversioned under `docs/<project>/`. A translation
lives in a parallel tree at
`i18n/<locale>/docusaurus-plugin-content-docs/current/<project>/`, mirroring the same
relative paths and filenames; adding a language never touches the English files. See
`docs/tsvrc/intro.md` and its Spanish counterpart for a worked example to copy. Before
translating a technical term, check how the target language's own community or official
docs (Unity's localized manual, GitHub's glossary) actually render it rather than
translating literally.

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
