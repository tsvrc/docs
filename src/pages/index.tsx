import type { ReactNode } from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Layout from '@theme/Layout';
import Translate, { translate } from '@docusaurus/Translate';

function Hero() {
  const logo = useBaseUrl('img/tsvrc-logo.png');
  return (
    <header className="border-b border-border bg-canvas">
      <div className="mx-auto max-w-4xl px-6 py-20 sm:py-28 text-center">
        <img
          src={logo}
          alt=""
          className="mx-auto mb-6 h-16 w-16 rounded-xl"
          width={64}
          height={64}
        />
        <h1 className="font-heading text-4xl sm:text-5xl font-semibold tracking-tight text-fg">
          <Translate id="homepage.hero.title">
            Tools for building VRChat worlds and avatars
          </Translate>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-fg-muted">
          <Translate id="homepage.hero.subtitle">
            TsVRC builds open-source tools for VRChat creators, starting with a framework for
            structuring UdonSharp world code.
          </Translate>
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/framework"
            className="rounded-md bg-accent-emphasis px-5 py-2.5 font-medium text-white no-underline hover:no-underline hover:opacity-90">
            <Translate id="homepage.hero.cta.explore">Explore TsVRC</Translate>
          </Link>
          <Link
            href="https://github.com/tsvrc"
            className="rounded-md border border-border px-5 py-2.5 font-medium text-fg no-underline hover:no-underline hover:border-accent">
            <Translate id="homepage.hero.cta.github">View on GitHub</Translate>
          </Link>
        </div>
      </div>
    </header>
  );
}

function TrustBar() {
  return (
    <div className="border-b border-border bg-canvas-subtle">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-4 px-6 py-4">
        <a href="https://github.com/tsvrc/tsvrc-core" className="opacity-90 hover:opacity-100">
          <img
            src="https://img.shields.io/github/stars/tsvrc/tsvrc-core?style=flat&label=stars&color=58a6ff&labelColor=161b22"
            alt={translate({
              id: 'homepage.trust.starsAlt',
              message: 'GitHub stars for tsvrc/tsvrc-core',
            })}
            height={20}
          />
        </a>
        <a href="https://github.com/tsvrc/tsvrc-core/commits/main" className="opacity-90 hover:opacity-100">
          <img
            src="https://img.shields.io/github/last-commit/tsvrc/tsvrc-core?style=flat&label=last%20commit&color=58a6ff&labelColor=161b22"
            alt={translate({
              id: 'homepage.trust.lastCommitAlt',
              message: 'Last commit to tsvrc/tsvrc-core',
            })}
            height={20}
          />
        </a>
        <a href="https://github.com/tsvrc/tsvrc-core/blob/main/LICENSE" className="opacity-90 hover:opacity-100">
          <img
            src="https://img.shields.io/github/license/tsvrc/tsvrc-core?style=flat&color=58a6ff&labelColor=161b22"
            alt={translate({
              id: 'homepage.trust.licenseAlt',
              message: 'tsvrc/tsvrc-core license',
            })}
            height={20}
          />
        </a>
      </div>
    </div>
  );
}

type Project = {
  name: string;
  status: 'available' | 'planned';
  description: string;
  href: string;
  cta: string;
};

function useProjects(): Project[] {
  return [
    {
      name: 'TsVRC',
      status: 'available',
      description: translate({
        id: 'homepage.projects.tsvrc.description',
        message:
          'A structured way to build VRChat worlds with UdonSharp: consistent startup, ' +
          'wired-up dependencies, and generated code instead of hand-wiring everything yourself.',
      }),
      href: '/framework',
      cta: translate({ id: 'homepage.projects.learnMore', message: 'Learn more' }),
    },
  ];
}

function statusLabel(status: Project['status']): string {
  return status === 'available'
    ? translate({ id: 'homepage.projects.status.available', message: 'Available' })
    : translate({ id: 'homepage.projects.status.planned', message: 'Planned' });
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <div className="flex flex-col justify-between rounded-lg border border-border bg-canvas-subtle p-6">
      <div>
        <div className="flex items-center gap-2">
          <h3 className="font-heading text-xl font-semibold text-fg">{project.name}</h3>
          <span className="rounded-full border border-border px-2 py-0.5 text-xs text-fg-muted">
            {statusLabel(project.status)}
          </span>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-fg-muted">{project.description}</p>
      </div>
      <Link
        to={project.href}
        className="mt-5 inline-block text-sm font-medium text-accent no-underline hover:underline">
        {project.cta} →
      </Link>
    </div>
  );
}

function Projects() {
  const projects = useProjects();
  return (
    <section className="mx-auto max-w-4xl px-6 py-16">
      <h2 className="font-heading text-2xl font-semibold text-fg">
        <Translate id="homepage.projects.title">Projects</Translate>
      </h2>
      <p className="mt-2 max-w-2xl text-fg-muted">
        <Translate
          id="homepage.projects.description"
          values={{
            intro: (
              <Link
                to="/docs/tsvrc/intro#this-site"
                className="text-accent no-underline hover:underline">
                <Translate id="homepage.projects.introLinkText">the intro</Translate>
              </Link>
            ),
          }}>
          {'Every TsVRC project lives on this one site. See why in {intro}. Just one so far; more will land here as they ship.'}
        </Translate>
      </p>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {projects.map((project) => (
          <ProjectCard key={project.name} project={project} />
        ))}
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  return (
    <Layout
      title={translate({ id: 'homepage.meta.title', message: 'TsVRC' })}
      description={translate({
        id: 'homepage.meta.description',
        message: 'TsVRC builds open-source tools for VRChat world and avatar creators.',
      })}>
      <Hero />
      <TrustBar />
      <Projects />
    </Layout>
  );
}
