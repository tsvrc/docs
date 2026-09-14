# AGENTS.md

## Project overview

Docusaurus site (TypeScript, Node 20+) documenting every project under the `tsvrc` org,
namespaced under `docs/<project>/` rather than one repo per project.

## Setup

- `npm install`
- `npm start` for a dev server at `http://localhost:3000`. Content hot-reloads; restart
  after changing `docusaurus.config.ts`.

## Build / verify

- `npm run build` before calling any change done. `onBrokenLinks: 'throw'` fails the
  build on a broken link, catching mistakes `npm start` won't.

## Code style

- Follow `.claude/rules/doc-structure.md` (Diátaxis categories, linking instead of
  duplicating) and `.claude/rules/writing-style.md` (avoid AI-sounding prose) for any
  `.md`/`.mdx` change, despite the `.claude/` path these apply to any contributor.
- See `CONTRIBUTING.md` for the multi-project layout and the i18n contribution path.

## Commit / PR rules

- Every commit must be signed off (`git commit -s`) per the
  [DCO](https://developercertificate.org/).
- Disclose AI assistance in the PR description. You're responsible for checking the
  result renders correctly, the same as if you'd written it by hand.

## Security

- Don't commit secrets or API tokens. Report vulnerabilities per `SECURITY.md`, not as a
  public issue.
