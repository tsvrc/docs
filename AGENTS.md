# AGENTS.md

Docusaurus site (TypeScript, Node 20+) for every project in the `tsvrc` org, one folder per project
under `docs/<project>/`. [CONTRIBUTING.md](CONTRIBUTING.md) covers the layout, translations and pull
requests, and [STYLE_GUIDE.md](STYLE_GUIDE.md) covers writing; follow both. This file only adds what
they leave out.

## Verify

Run `npm run build` before calling a change done. It builds both locales and fails on a broken
link, which `npm start` doesn't catch.

## Gotchas

- `sidebars.ts` is written by hand. A `dirName` pointed at a leaf folder returns an unlabeled flat
  list, so the `label` of a category comes from its wrapping `{type: 'category', ...}` node, not a
  `_category_.json`.
- The code of each project lives in its own repo (such as `udon-test-kit`), and nothing keeps it in
  sync with this one. When the public behavior of a project changes, check its pages here.
