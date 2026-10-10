import Link from '@docusaurus/Link';
import { translate } from '@docusaurus/Translate';

export type Project = {
  name: string;
  status: 'available' | 'planned';
  description: string;
  docsHref: string;
  // The GitHub repository, as "owner/name".
  repo: string;
};

const badgeStyle = 'style=flat&color=58a6ff&labelColor=161b22';

function statusLabel(status: Project['status']): string {
  return status === 'available'
    ? translate({ id: 'homepage.projects.status.available', message: 'Available' })
    : translate({ id: 'homepage.projects.status.planned', message: 'Planned' });
}

function badges(repo: string) {
  const github = `https://github.com/${repo}`;
  return [
    {
      src: `https://img.shields.io/github/stars/${repo}?label=stars&${badgeStyle}`,
      href: `${github}/stargazers`,
      alt: translate({ id: 'homepage.projects.badge.stars', message: 'GitHub stars for {repo}' }, { repo }),
    },
    {
      src: `https://img.shields.io/github/license/${repo}?${badgeStyle}`,
      href: github,
      alt: translate({ id: 'homepage.projects.badge.license', message: 'License of {repo}' }, { repo }),
    },
    {
      src: `https://img.shields.io/github/v/release/${repo}?label=release&${badgeStyle}`,
      href: `${github}/releases`,
      alt: translate({ id: 'homepage.projects.badge.release', message: 'Latest release of {repo}' }, { repo }),
    },
    {
      src: `https://img.shields.io/github/last-commit/${repo}?label=last%20commit&${badgeStyle}`,
      href: `${github}/commits`,
      alt: translate({ id: 'homepage.projects.badge.lastCommit', message: 'Last commit to {repo}' }, { repo }),
    },
  ];
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
        <div className="mt-4 flex flex-wrap gap-2">
          {badges(project.repo).map((badge) => (
            <a key={badge.src} href={badge.href} className="opacity-90 hover:opacity-100">
              <img src={badge.src} alt={badge.alt} height={20} />
            </a>
          ))}
        </div>
      </div>
      <div className="mt-5 flex gap-5 text-sm font-medium">
        <Link to={project.docsHref} className="text-accent no-underline hover:underline">
          {translate({ id: 'homepage.projects.docs', message: 'Docs' })} →
        </Link>
        <Link href={`https://github.com/${project.repo}`} className="text-fg-muted no-underline hover:underline">
          GitHub →
        </Link>
      </div>
    </div>
  );
}
