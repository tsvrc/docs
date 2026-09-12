import Translate, { translate } from '@docusaurus/Translate';
import ProjectCard, { type Project } from '@site/src/components/homepage/ProjectCard';

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

export default function Projects() {
  const projects = useProjects();
  return (
    <section className="mx-auto max-w-4xl px-6 py-16">
      <h2 className="font-heading text-2xl font-semibold text-fg">
        <Translate id="homepage.projects.title">Projects</Translate>
      </h2>
      <p className="mt-2 max-w-2xl text-fg-muted">
        <Translate id="homepage.projects.description">
          Every TsVRC project lives on this one site. Just one so far; more will land here as
          they ship.
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
