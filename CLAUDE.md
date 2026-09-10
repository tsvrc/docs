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
