import Translate from '@docusaurus/Translate';

export default function Hero() {
  return (
    <header className="border-b border-border bg-canvas">
      <div className="mx-auto max-w-4xl px-6 py-16 sm:py-20">
        <div className="flex items-center gap-5">
          <img
            src="https://github.com/ToniSeas.png?size=160"
            alt=""
            className="h-20 w-20 rounded-full border border-border"
            width={80}
            height={80}
          />
          <h1 className="font-heading text-4xl sm:text-5xl font-semibold tracking-tight text-fg">
            <Translate id="homepage.hero.greeting">Hi, I&apos;m Toni</Translate>
          </h1>
        </div>
        <p className="mt-6 max-w-2xl text-lg text-fg-muted">
          <Translate id="homepage.hero.intro">
            I build tools for VRChat creators. TsVRC is the name I publish them under, and most of
            them are open source.
          </Translate>
        </p>
      </div>
    </header>
  );
}
