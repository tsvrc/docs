import type { ReactNode } from 'react';
import Link from '@docusaurus/Link';
import CodeBlock from '@theme/CodeBlock';
import Layout from '@theme/Layout';

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
            A framework for VRChat worlds built on UdonSharp
          </h1>
          <p className="mt-4 text-lg text-fg-muted">
            Structured initialization, dependency wiring, and editor codegen, so your
            world scripts extend a typed base class instead of hand-wiring references
            every time you add a behaviour.
          </p>
          <p className="mt-2 font-mono text-xs text-fg-muted">com.tsvrc.core</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/docs/tsvrc/intro"
              className="rounded-md bg-accent-emphasis px-5 py-2.5 font-medium text-white no-underline hover:no-underline hover:opacity-90">
              Read the docs
            </Link>
            <Link
              href="https://github.com/tsvrc/tsvrc-core"
              className="rounded-md border border-border px-5 py-2.5 font-medium text-fg no-underline hover:no-underline hover:border-accent">
              View on GitHub
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

function ProblemSolution() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-16">
      <h2 className="font-heading text-2xl font-semibold text-fg">Why it exists</h2>
      <p className="mt-4 leading-relaxed text-fg-muted">
        Raw UdonSharp gives you a scene full of behaviours with no shared way to find each
        other, no ordering guarantee for setup, and no help resolving which concrete class
        a given slot in your project should use. Every world ends up hand-rolling the same
        answers: manager singletons wired by drag-and-drop, an ad hoc load order, references
        assigned in the inspector and hoped-for at runtime.
      </p>
      <p className="mt-4 leading-relaxed text-fg-muted">
        TsVRC replaces that with one root object (<code>_ts</code>) every behaviour holds a
        reference to, a defined construction order, and a generation step that resolves your
        project's own types once, in the editor, instead of at runtime. See{' '}
        <Link
          to="/docs/tsvrc/core-concepts/how-it-fits-together"
          className="text-accent no-underline hover:underline">
          how TsVRC fits together
        </Link>{' '}
        for the full shape.
      </p>
    </section>
  );
}

type Advantage = {
  title: string;
  description: string;
  href: string;
};

const advantages: Advantage[] = [
  {
    title: 'Structured initialization',
    description:
      'A defined construction order and a single TsStart hook, so setup order stops being a per-project guess.',
    href: '/docs/tsvrc/core-concepts/how-it-fits-together',
  },
  {
    title: 'Dependency wiring',
    description:
      'Every behaviour reaches the rest of the framework through one typed _ts reference (Memory, Log, Instance) instead of separately hunting down each one.',
    href: '/docs/tsvrc/core-concepts/ts-root',
  },
  {
    title: 'Editor codegen, not runtime reflection',
    description:
      "Type resolution happens once in the editor, while C# reflection is still available, and bakes into generated code, because compiled Udon can't do reflection at all.",
    href: '/docs/tsvrc/explanations/codegen-vs-reflection',
  },
];

function Advantages() {
  return (
    <section className="border-t border-border bg-canvas-subtle">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="font-heading text-2xl font-semibold text-fg">Advantages</h2>
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          {advantages.map((item) => (
            <div key={item.title} className="rounded-lg border border-border bg-canvas p-6">
              <h3 className="font-heading text-lg font-semibold text-fg">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-fg-muted">{item.description}</p>
              <Link
                to={item.href}
                className="mt-4 inline-block text-sm font-medium text-accent no-underline hover:underline">
                Details →
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
      <h2 className="font-heading text-2xl font-semibold text-fg">Start building</h2>
      <p className="mx-auto mt-3 max-w-xl text-fg-muted">
        Add the package through VCC and have a behaviour running in play mode by the end of
        the first tutorial page.
      </p>
      <div className="mt-6">
        <Link
          to="/docs/tsvrc/first-behaviour"
          className="rounded-md bg-accent-emphasis px-5 py-2.5 font-medium text-white no-underline hover:no-underline hover:opacity-90">
          Build your first behaviour
        </Link>
      </div>
    </section>
  );
}

export default function Framework(): ReactNode {
  return (
    <Layout
      title="TsVRC Core"
      description="TsVRC Core is a framework for building VRChat worlds with UdonSharp: structured initialization, dependency wiring, and editor codegen.">
      <Hero />
      <ProblemSolution />
      <Advantages />
      <FinalCta />
    </Layout>
  );
}
