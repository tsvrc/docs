# TsVRC docs

[![Deploy](https://github.com/tsvrc/docs/actions/workflows/deploy.yml/badge.svg)](https://github.com/tsvrc/docs/actions/workflows/deploy.yml)
[![License: CC BY 4.0](https://img.shields.io/badge/license-CC%20BY%204.0-58a6ff?labelColor=161b22)](LICENSE)

The [Docusaurus](https://docusaurus.io/) site behind [tsvrc.com](https://tsvrc.com),
documenting every project under the `tsvrc` GitHub org. Framework code lives in
[`tsvrc/tsvrc-core`](https://github.com/tsvrc/tsvrc-core); this repo is docs and content
only.

## Development

```bash
npm install
npm start
```

`npm start` runs a hot-reloading dev server at `http://localhost:3000`. Content changes
reload live; changes to `docusaurus.config.ts` need a server restart.

```bash
npm run build
```

Builds the static site into `build/`. `onBrokenLinks: 'throw'` means a broken internal
link fails this command, so run it before calling a doc change done.

## Deployment

Every push to `main` builds and deploys to GitHub Pages automatically via
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). There's no manual deploy
step.

## Support

Support TsVRC at [tsvrc.com/support](https://tsvrc.com/support).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the writing style guide, the multi-project
layout, and how to submit a change. Community conduct is covered by the
[org-wide Code of Conduct](https://github.com/tsvrc/.github/blob/main/CODE_OF_CONDUCT.md),
and [GOVERNANCE.md](https://github.com/tsvrc/.github/blob/main/GOVERNANCE.md) covers how
decisions get made. Found a security issue? See [SECURITY.md](SECURITY.md) rather than
opening a public issue.

## License

This repository is licensed under [CC BY 4.0](LICENSE). Code samples embedded in a
project's doc pages (under `docs/<project>/`) that are drawn directly from that project's
own repository keep that project's license, not this repository's, since they originate
there. Check the linked project's own `LICENSE` for the specific terms.

The TsVRC name and logo are governed separately, see
[TRADEMARK.md](https://github.com/tsvrc/.github/blob/main/TRADEMARK.md).
