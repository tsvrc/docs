import Link from '@docusaurus/Link';
import Translate, { translate } from '@docusaurus/Translate';

type Option = {
  id: string;
  name: string;
  description: string;
  cta: string;
  href: string;
};

function useOptions(): Option[] {
  return [
    {
      id: 'patreon',
      name: 'Patreon',
      description: translate({
        id: 'support.options.patreon.description',
        message: 'A monthly membership at patreon.com/Tsvrc.',
      }),
      cta: translate({ id: 'support.options.patreon.cta', message: 'Support on Patreon' }),
      href: 'https://www.patreon.com/Tsvrc',
    },
    {
      id: 'kofi',
      name: 'Ko-fi',
      description: translate({
        id: 'support.options.kofi.description',
        message: 'One-time tips or a monthly membership at ko-fi.com/tsvrc.',
      }),
      cta: translate({ id: 'support.options.kofi.cta', message: 'Support on Ko-fi' }),
      href: 'https://ko-fi.com/tsvrc',
    },
  ];
}

export default function Options() {
  const options = useOptions();
  return (
    <section className="mx-auto max-w-3xl px-6 py-16">
      <h2 className="font-heading text-2xl font-semibold text-fg">
        <Translate id="support.options.title">Ways to support</Translate>
      </h2>
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {options.map((option) => (
          <div
            key={option.id}
            className="flex flex-col justify-between rounded-lg border border-border bg-canvas-subtle p-6">
            <div>
              <h3 className="font-heading text-xl font-semibold text-fg">{option.name}</h3>
              <p className="mt-3 text-sm leading-relaxed text-fg-muted">{option.description}</p>
            </div>
            <Link
              href={option.href}
              className="mt-5 inline-block rounded-md bg-accent-emphasis px-4 py-2 text-center text-sm font-medium text-white no-underline hover:no-underline hover:opacity-90">
              {option.cta}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
