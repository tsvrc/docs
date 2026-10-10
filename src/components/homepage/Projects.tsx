import Translate, { translate } from '@docusaurus/Translate';
import ProjectCard, { type Project } from '@site/src/components/homepage/ProjectCard';

function useProjects(): Project[] {
  return [
    {
      name: 'Core',
      status: 'available',
      description: translate({
        id: 'homepage.projects.tsvrc.description',
        message:
          'A structured way to build VRChat worlds with UdonSharp: consistent startup, ' +
          'wired-up dependencies, and generated code instead of hand-wiring everything yourself.',
      }),
      docsHref: '/docs/tsvrc/intro',
      repo: 'tsvrc/tsvrc-core',
    },
    {
      name: 'Test Kit',
      status: 'available',
      description: translate({
        id: 'homepage.projects.testKit.description',
        message:
          'Automated tests for VRChat worlds: Play Mode tests run your UdonSharp behaviours in a ' +
          'real ClientSim session, with real players.',
      }),
      docsHref: '/docs/test-kit/intro',
      repo: 'tsvrc/udon-test-kit',
    },
  ];
}

export default function Projects() {
  const projects = useProjects();
  return (
    <div className="bg-section">
      <section className="mx-auto max-w-4xl px-6 pt-10 pb-16">
        <h2 className="font-heading text-2xl font-semibold text-fg">
          <Translate id="homepage.projects.title">Projects</Translate>
        </h2>
        <p className="mt-2 max-w-2xl text-fg-muted">
          <Translate id="homepage.projects.description">
            Everything built so far. Each project has its docs here and its code on GitHub.
          </Translate>
        </p>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard key={project.name} project={project} />
          ))}
        </div>
      </section>
    </div>
  );
}
