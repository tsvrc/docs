import Link from '@docusaurus/Link';
import Admonition from '@theme/Admonition';
import Translate, { translate } from '@docusaurus/Translate';

export default function GetStarted() {
  return (
    <section id="get-started" className="scroll-mt-20 border-t border-border bg-canvas">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Admonition
          type="warning"
          title={translate({
            id: 'framework.notice.title',
            message: 'Before you build on this',
          })}>
          <p>
            <Translate id="framework.notice.vrchat">
              TsVRC is not affiliated with or endorsed by VRChat Inc.
            </Translate>
          </p>
          <p>
            <Translate id="framework.notice.body">
              It&apos;s also still a work in progress. Every part of it has its own tests,
              and we run them before every release, but we can&apos;t promise
              we&apos;ve caught every case. Keep a backup of your project before adding
              TsVRC to it or updating it, just to be safe. If something breaks on your end, we
              can&apos;t fix it for you, but we&apos;d really like to know about it.
              Open an issue on GitHub and we&apos;ll take a look.
            </Translate>
          </p>
        </Admonition>
        <div className="mt-10 text-center">
          <h2 className="font-heading text-2xl font-semibold text-fg">
            <Translate id="framework.cta.title">Start building</Translate>
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-fg-muted">
            <Translate id="framework.cta.subtitle">
              Add the package through VCC and have a behaviour running in play mode by the end of
              the first tutorial page.
            </Translate>
          </p>
          <div className="mt-6">
            <Link
              to="/docs/tsvrc/first-behaviour"
              className="rounded-md bg-accent-emphasis px-5 py-2.5 font-medium text-white no-underline hover:no-underline hover:opacity-90">
              <Translate id="framework.cta.button">Build your first behaviour</Translate>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
