# Contributing to TsVRC docs

Fixes, new pages and translations are welcome. Before you add a page or change how the site is
organized, open an issue to agree on it. Questions go in
[GitHub Discussions](https://github.com/orgs/tsvrc/discussions).

## Setup

You need Node 20 or later.

```bash
npm install
npm start
```

`npm start` serves the site at `http://localhost:3000` and reloads it when content changes. Restart
it after changing `docusaurus.config.ts`. Before you open a pull request, run `npm run build`: it
builds both languages and fails on a broken link, which `npm start` doesn't catch. Every push to
`main` deploys the site.

## Writing a page

Pages follow the [Diátaxis framework](https://diataxis.fr/) and [STYLE_GUIDE.md](STYLE_GUIDE.md).
Read the style guide before you write or edit a page. A page about a project must match what its
code does.

## Multi-project layout

Each TsVRC project gets its own `docs/<project>/` folder here instead of its own docs repo, plus a
top-level category in `sidebars.ts`. Every project shares one sidebar, so a category whose label
another project already uses, such as "Reference", needs a unique `key`. Without one, the Spanish
build fails on a duplicate translation key. `docs/udon-test-kit/` is set up this way.

A page every project shares, such as [Install a TsVRC package](docs/install-a-package.md), sits at
the root of `docs/`. Each project install page links to it and adds only what's specific to that
project: the package name, requirements, and how to check that it worked.

The docs of a project stand on their own. When one project depends on another, the dependent
project links to the other where a reader needs it, and the project depended on never mentions its
consumers.

## Adding a translation

English pages live in `docs/<project>/`. A translation mirrors the same paths and file names under
`i18n/<locale>/docusaurus-plugin-content-docs/current/<project>/`, so adding a language never
touches the English files.
Pages in `src/pages/` translate through `@docusaurus/Translate` instead, with their strings in
`i18n/<locale>/code.json`.

- A heading that another page links to by anchor needs an id that survives translation. In
  Docusaurus MDX v3 that's a comment, not `{#id}`: `## Play Mode tests {/* #play-mode-tests */}`.
- Sidebar category labels live in `sidebars.ts`, which isn't translated, so they stay English in
  every locale.
- Don't override the Docusaurus theme strings (pagination, admonition labels, sidebar buttons) in
  `code.json`: the theme ships its own translations. The search plugin
  (`@easyops-cn/docusaurus-search-local`) ships no Spanish, so its `theme.SearchBar.*` and
  `theme.SearchPage.*` strings are the exception.
- Before translating a technical term, check how the localized Unity manual, the GitHub glossary
  or the VRChat community writes it. Some terms stay in English. Code identifiers such as
  `_ts.Memory` and `TsStart` are never translated, in prose either.

## Submitting a pull request

1. Sign off every commit (`git commit -s`) per the
   [Developer Certificate of Origin](https://developercertificate.org/). It certifies you wrote the
   change, or otherwise have the right to submit it under the CC BY 4.0 license, so only you can
   add it, never a tool. A check fails the pull request if any of its commits isn't signed off.
2. If AI tools helped, say which parts and how in the pull request description. You're the author
   either way: read, understand and check all of it in the built site before you submit it, and be
   ready to explain it in review. A pull request that's mostly unreviewed AI output, and would take
   longer to review than it saves, will be closed.
3. Open the pull request, describing what it changes and why. Community conduct is covered by the
   [org-wide Code of Conduct](https://github.com/tsvrc/.github/blob/main/CODE_OF_CONDUCT.md).

## Reporting a security vulnerability

Don't open a public issue for this. See [SECURITY.md](SECURITY.md).
