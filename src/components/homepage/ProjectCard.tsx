import Link from '@docusaurus/Link';
import { translate } from '@docusaurus/Translate';

export type Project = {
  name: string;
  status: 'available' | 'planned';
  description: string;
  href: string;
  cta: string;
};

function statusLabel(status: Project['status']): string {
  return status === 'available'
    ? translate({ id: 'homepage.projects.status.available', message: 'Available' })
    : translate({ id: 'homepage.projects.status.planned', message: 'Planned' });
}

export default function ProjectCard({ project }: { project: Project }) {
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
