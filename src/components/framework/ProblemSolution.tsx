import Link from '@docusaurus/Link';
import Translate from '@docusaurus/Translate';

export default function ProblemSolution() {
  return (
    <section id="why" className="mx-auto max-w-3xl scroll-mt-20 px-6 py-16">
      <h2 className="font-heading text-2xl font-semibold text-fg">
        <Translate id="framework.why.title">Why it exists</Translate>
      </h2>
      <p className="mt-4 leading-relaxed text-fg-muted">
        <Translate id="framework.why.paragraph1">
          Every UdonSharp script starts on its own, with no guarantee of what order things
          happen in and no easy way to reach another script elsewhere in your world. Most
          creators solve this by hand: dragging references between objects in the Inspector,
          then hoping everything is still connected when the world loads.
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
          {"TsVRC gives every script one shared reference, {code}, to reach anything else in your project. Setup happens in an order you control, and TsVRC works out which of your own classes to use ahead of time, in the Unity editor. See {link} for the full shape."}
        </Translate>
      </p>
    </section>
  );
}
