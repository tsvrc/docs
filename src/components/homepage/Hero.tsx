import Link from '@docusaurus/Link';
import Translate, { translate } from '@docusaurus/Translate';

// The logo's tile as a band: its charcoal, its near-white, and its blue used once, on the name.
export default function Hero() {
  return (
    <header className="ts-dot-grid bg-brand dark:border-b dark:border-border">
      <div className="mx-auto max-w-4xl px-6 py-14 sm:py-16">
        <div className="flex items-center gap-5">
          <Link href="https://github.com/ToniSeas" className="shrink-0 hover:opacity-90">
            <img
              src="https://github.com/ToniSeas.png?size=160"
              alt={translate({ id: 'homepage.hero.avatarAlt', message: 'Toni on GitHub' })}
              className="h-20 w-20 rounded-full ring-1 ring-white/20"
              width={80}
              height={80}
            />
          </Link>
          <h1 className="font-heading text-4xl sm:text-5xl font-semibold tracking-tight text-brand-fg">
            <Translate
              id="homepage.hero.greeting"
              values={{ name: <span className="text-brand-accent">Toni</span> }}>
              {"Hi, I'm {name}"}
            </Translate>
          </h1>
        </div>
        <p className="mt-6 max-w-2xl text-lg text-brand-muted">
          <Translate id="homepage.hero.intro">
            I build tools for making VRChat worlds. TsVRC is the name I publish them under, and
            most of them are open source.
          </Translate>
        </p>
      </div>
    </header>
  );
}
