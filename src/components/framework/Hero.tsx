import Link from '@docusaurus/Link';
import Translate from '@docusaurus/Translate';
import AnnotatedCode from '@site/src/components/framework/AnnotatedCode';
import ScrollCue from '@site/src/components/framework/ScrollCue';

export default function Hero() {
  return (
    <header className="border-b border-border bg-canvas">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-6 py-16 sm:py-20 lg:grid-cols-[30rem_1fr]">
        <div>
          <p className="text-sm font-medium text-accent">TsVRC Core</p>
          <h1 className="mt-2 font-heading text-4xl font-semibold tracking-tight text-fg">
            <Translate id="framework.hero.title">
              A framework for VRChat worlds built on UdonSharp
            </Translate>
          </h1>
          <p className="mt-4 text-lg text-fg-muted">
            <Translate id="framework.hero.subtitle">
              Structured initialization, dependency wiring, and editor codegen, so your world
              scripts extend a typed base class instead of hand-wiring references every time
              you add a behaviour.
            </Translate>
          </p>
          <p className="mt-2 font-mono text-xs text-fg-muted">com.tsvrc.core</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/docs/tsvrc/intro"
              className="rounded-md bg-accent-emphasis px-5 py-2.5 font-medium text-white no-underline hover:no-underline hover:opacity-90">
              <Translate id="framework.hero.cta.docs">Read the docs</Translate>
            </Link>
            <Link
              href="https://github.com/tsvrc/tsvrc-core"
              className="rounded-md border border-border px-5 py-2.5 font-medium text-fg no-underline hover:no-underline hover:border-accent">
              <Translate id="framework.hero.cta.github">View on GitHub</Translate>
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-fg-muted">
            <span><Translate id="framework.hero.jumpToLabel">Jump to:</Translate></span>
            <a href="#why" className="text-fg-muted no-underline hover:text-accent hover:underline">
              <Translate id="framework.hero.jump.why">Why it exists</Translate>
            </a>
            <span aria-hidden="true">·</span>
            <a href="#building-blocks" className="text-fg-muted no-underline hover:text-accent hover:underline">
              <Translate id="framework.hero.jump.blocks">Building blocks</Translate>
            </a>
            <span aria-hidden="true">·</span>
            <a href="#get-started" className="text-fg-muted no-underline hover:text-accent hover:underline">
              <Translate id="framework.hero.jump.start">Get started</Translate>
            </a>
          </div>
        </div>
        <AnnotatedCode />
      </div>
      <ScrollCue />
    </header>
  );
}
