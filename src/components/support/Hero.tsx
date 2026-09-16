import Translate from '@docusaurus/Translate';

export default function Hero() {
  return (
    <header className="border-b border-border bg-canvas">
      <div className="mx-auto max-w-3xl px-6 py-16 sm:py-20 text-center">
        <h1 className="font-heading text-4xl sm:text-5xl font-semibold tracking-tight text-fg">
          <Translate id="support.hero.title">Support TsVRC</Translate>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-fg-muted">
          <Translate id="support.hero.subtitle">
            Supporting TsVRC is entirely optional, and genuinely appreciated if you choose to.
          </Translate>
        </p>
      </div>
    </header>
  );
}
