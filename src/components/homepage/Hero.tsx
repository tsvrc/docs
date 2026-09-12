import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Translate from '@docusaurus/Translate';

export default function Hero() {
  const logo = useBaseUrl('img/tsvrc-logo.png');
  return (
    <header className="border-b border-border bg-canvas">
      <div className="mx-auto max-w-4xl px-6 py-20 sm:py-28 text-center">
        <img
          src={logo}
          alt=""
          className="mx-auto mb-6 h-16 w-16 rounded-xl"
          width={64}
          height={64}
        />
        <h1 className="font-heading text-4xl sm:text-5xl font-semibold tracking-tight text-fg">
          <Translate id="homepage.hero.title">
            Tools for building VRChat worlds and avatars
          </Translate>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-fg-muted">
          <Translate id="homepage.hero.subtitle">
            TsVRC builds open-source tools for VRChat creators, starting with a framework for
            structuring UdonSharp world code.
          </Translate>
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/framework"
            className="rounded-md bg-accent-emphasis px-5 py-2.5 font-medium text-white no-underline hover:no-underline hover:opacity-90">
            <Translate id="homepage.hero.cta.explore">Explore TsVRC</Translate>
          </Link>
          <Link
            href="https://github.com/tsvrc"
            className="rounded-md border border-border px-5 py-2.5 font-medium text-fg no-underline hover:no-underline hover:border-accent">
            <Translate id="homepage.hero.cta.github">View on GitHub</Translate>
          </Link>
        </div>
      </div>
    </header>
  );
}
