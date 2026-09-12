import Link from '@docusaurus/Link';
import Translate, { translate } from '@docusaurus/Translate';

type Feature = {
  id: string;
  title: string;
  description: string;
  href: string;
};

function useFeatures(): Feature[] {
  return [
    {
      id: 'constructs',
      title: translate({
        id: 'framework.features.constructs.title',
        message: 'Constructs',
      }),
      description: translate({
        id: 'framework.features.constructs.description',
        message:
          'Register a TsvrcBehaviour once and TsVRC initializes it for you, in a fixed order, through TsStart, instead of you wiring startup by hand.',
      }),
      href: '/docs/tsvrc/codegen-configuring/construct-module',
    },
    {
      id: 'globals',
      title: translate({
        id: 'framework.features.globals.title',
        message: 'Globals',
      }),
      description: translate({
        id: 'framework.features.globals.description',
        message:
          'Point at a scene object once and every behaviour can read it back by name, instead of dragging the same reference into a dozen inspector slots.',
      }),
      href: '/docs/tsvrc/codegen-configuring/global-module',
    },
    {
      id: 'memory',
      title: translate({
        id: 'framework.features.memory.title',
        message: 'Memory',
      }),
      description: translate({
        id: 'framework.features.memory.description',
        message:
          "A shared key-value store with ephemeral, persistent, and synced tiers, so getting a value to every player doesn't mean writing your own networking.",
      }),
      href: '/docs/tsvrc/networking-data/tsvrc-memory',
    },
    {
      id: 'factories',
      title: translate({
        id: 'framework.features.factories.title',
        message: 'Factories',
      }),
      description: translate({
        id: 'framework.features.factories.description',
        message:
          "Spawn a prefab on demand with a generated _ts.Create... call, for anything that doesn't need to stay in sync across players.",
      }),
      href: '/docs/tsvrc/codegen-configuring/factory-module',
    },
    {
      id: 'pools',
      title: translate({
        id: 'framework.features.pools.title',
        message: 'Pools',
      }),
      description: translate({
        id: 'framework.features.pools.description',
        message:
          "Pre-instantiate and wire exactly the instances a networked prefab needs, at edit time, because VRChat can't sync an object created while the world is running.",
      }),
      href: '/docs/tsvrc/codegen-configuring/pool-module',
    },
    {
      id: 'instance',
      title: translate({
        id: 'framework.features.instance.title',
        message: 'Instance',
      }),
      description: translate({
        id: 'framework.features.instance.description',
        message:
          "One behaviour per project standing in for the running world instance itself, found and wired automatically, so instance-level checks like \"am I the master\" have one obvious home.",
      }),
      href: '/docs/tsvrc/core-concepts/instance',
    },
  ];
}

export default function Features() {
  const features = useFeatures();
  return (
    <section id="building-blocks" className="scroll-mt-20 border-t border-border bg-canvas-subtle">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="font-heading text-2xl font-semibold text-fg">
          <Translate id="framework.features.title">The building blocks</Translate>
        </h2>
        <p className="mt-2 max-w-2xl text-fg-muted">
          <Translate id="framework.features.subtitle">
            Six generated pieces cover most of what a world needs. Register or point at
            something once, then reach it the same way from every behaviour.
          </Translate>
        </p>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((item) => (
            <div
              key={item.id}
              id={`feature-${item.id}`}
              className="scroll-mt-20 rounded-lg border border-border bg-canvas p-6">
              <h3 className="font-heading text-lg font-semibold text-fg">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-fg-muted">{item.description}</p>
              <Link
                to={item.href}
                className="mt-4 inline-block text-sm font-medium text-accent no-underline hover:underline">
                <Translate id="framework.features.detailsLink">Details →</Translate>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
