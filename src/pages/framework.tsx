import type { ReactNode } from 'react';
import Link from '@docusaurus/Link';
import CodeBlock from '@theme/CodeBlock';
import Layout from '@theme/Layout';
import Admonition from '@theme/Admonition';
import Translate, { translate } from '@docusaurus/Translate';

const exampleCode = `using Tsvrc.Core.Generated;

public class HelloWorld : TsBehaviour
{
    protected override void TsStart()
    {
        LogInfo("HelloWorld constructed.");
    }
}`;

function Hero() {
  return (
    <header className="border-b border-border bg-canvas">
      <div className="mx-auto grid max-w-5xl grid-cols-1 items-center gap-10 px-6 py-16 sm:py-20 md:grid-cols-2">
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
        </div>
        <div className="text-sm">
          <CodeBlock language="csharp" title="HelloWorld.cs">
            {exampleCode}
          </CodeBlock>
        </div>
      </div>
    </header>
  );
}

function DevNotice() {
  return (
    <section className="mx-auto max-w-3xl px-6 pt-12">
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
    </section>
  );
}

function ProblemSolution() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-16">
      <h2 className="font-heading text-2xl font-semibold text-fg">
        <Translate id="framework.why.title">Why it exists</Translate>
      </h2>
      <p className="mt-4 leading-relaxed text-fg-muted">
        <Translate id="framework.why.paragraph1">
          Raw UdonSharp gives you a scene full of behaviours with no shared way to find each
          other, no ordering guarantee for setup, and no help resolving which concrete class a
          given slot in your project should use. Every world ends up hand-rolling the same
          answers: manager singletons wired by drag-and-drop, an ad hoc load order, references
          assigned in the inspector and hoped-for at runtime.
        </Translate>
      </p>
      <p className="mt-4 leading-relaxed text-fg-muted">
        <Translate
          id="framework.why.paragraph2"
          values={{
            link: (
              <Link
                to="/docs/tsvrc/core-concepts/how-it-fits-together"
                className="text-accent no-underline hover:underline">
                <Translate id="framework.why.linkText">how TsVRC fits together</Translate>
              </Link>
            ),
            code: <code>_ts</code>,
          }}>
          {'TsVRC replaces that with one root object ({code}) every behaviour holds a reference to, a defined construction order, and a generation step that resolves your project\'s own types once, in the editor, instead of at runtime. See {link} for the full shape.'}
        </Translate>
      </p>
    </section>
  );
}

type Advantage = {
  title: string;
  description: string;
  href: string;
};

function useAdvantages(): Advantage[] {
  return [
    {
      title: translate({
        id: 'framework.advantages.init.title',
        message: 'Structured initialization',
      }),
      description: translate({
        id: 'framework.advantages.init.description',
        message:
          'A defined construction order and a single TsStart hook, so setup order stops being a per-project guess.',
      }),
      href: '/docs/tsvrc/core-concepts/how-it-fits-together',
    },
    {
      title: translate({
        id: 'framework.advantages.wiring.title',
        message: 'Dependency wiring',
      }),
      description: translate({
        id: 'framework.advantages.wiring.description',
        message:
          'Every behaviour reaches the rest of the framework through one typed _ts reference (Memory, Log, Instance) instead of separately hunting down each one.',
      }),
      href: '/docs/tsvrc/core-concepts/ts-root',
    },
    {
      title: translate({
        id: 'framework.advantages.codegen.title',
        message: 'Editor codegen, not runtime reflection',
      }),
      description: translate({
        id: 'framework.advantages.codegen.description',
        message:
          "Type resolution happens once in the editor, while C# reflection is still available, and bakes into generated code, because compiled Udon can't do reflection at all.",
      }),
      href: '/docs/tsvrc/explanations/codegen-vs-reflection',
    },
  ];
}

function Advantages() {
  const advantages = useAdvantages();
  return (
    <section className="border-t border-border bg-canvas-subtle">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="font-heading text-2xl font-semibold text-fg">
          <Translate id="framework.advantages.title">Advantages</Translate>
        </h2>
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          {advantages.map((item) => (
            <div key={item.title} className="rounded-lg border border-border bg-canvas p-6">
              <h3 className="font-heading text-lg font-semibold text-fg">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-fg-muted">{item.description}</p>
              <Link
                to={item.href}
                className="mt-4 inline-block text-sm font-medium text-accent no-underline hover:underline">
                <Translate id="framework.advantages.detailsLink">Details →</Translate>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-16 text-center">
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
    </section>
  );
}

export default function Framework(): ReactNode {
  return (
    <Layout
      title={translate({ id: 'framework.meta.title', message: 'TsVRC Core' })}
      description={translate({
        id: 'framework.meta.description',
        message:
          'TsVRC Core is a framework for building VRChat worlds with UdonSharp: structured initialization, dependency wiring, and editor codegen.',
      })}>
      <Hero />
      <DevNotice />
      <ProblemSolution />
      <Advantages />
      <FinalCta />
    </Layout>
  );
}
