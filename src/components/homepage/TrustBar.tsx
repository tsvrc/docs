import { translate } from '@docusaurus/Translate';

export default function TrustBar() {
  return (
    <div className="border-b border-border bg-canvas-subtle">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-4 px-6 py-4">
        <a href="https://github.com/tsvrc/tsvrc-core" className="opacity-90 hover:opacity-100">
          <img
            src="https://img.shields.io/github/stars/tsvrc/tsvrc-core?style=flat&label=stars&color=58a6ff&labelColor=161b22"
            alt={translate({
              id: 'homepage.trust.starsAlt',
              message: 'GitHub stars for tsvrc/tsvrc-core',
            })}
            height={20}
          />
        </a>
        <a href="https://github.com/tsvrc/tsvrc-core/commits/main" className="opacity-90 hover:opacity-100">
          <img
            src="https://img.shields.io/github/last-commit/tsvrc/tsvrc-core?style=flat&label=last%20commit&color=58a6ff&labelColor=161b22"
            alt={translate({
              id: 'homepage.trust.lastCommitAlt',
              message: 'Last commit to tsvrc/tsvrc-core',
            })}
            height={20}
          />
        </a>
        <a href="https://github.com/tsvrc/tsvrc-core/blob/main/LICENSE" className="opacity-90 hover:opacity-100">
          <img
            src="https://img.shields.io/github/license/tsvrc/tsvrc-core?style=flat&color=58a6ff&labelColor=161b22"
            alt={translate({
              id: 'homepage.trust.licenseAlt',
              message: 'tsvrc/tsvrc-core license',
            })}
            height={20}
          />
        </a>
      </div>
    </div>
  );
}
