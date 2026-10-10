import { useEffect, useState } from 'react';
import Link from '@docusaurus/Link';
import { translate } from '@docusaurus/Translate';
import { LawIcon, MarkGithubIcon, StarIcon, TagIcon, type Icon } from '@primer/octicons-react';

export type Project = {
  name: string;
  status: 'available' | 'planned';
  description: string;
  docsHref: string;
  // The GitHub repository, as "owner/name".
  repo: string;
};

type StatKind = 'stars' | 'license' | 'release';
type Stat = { kind: StatKind; value: string };

const statPaths: Record<StatKind, string> = { stars: 'stars', license: 'license', release: 'v/release' };
const statIcons: Record<StatKind, Icon> = { stars: StarIcon, license: LawIcon, release: TagIcon };

function statLabel(kind: StatKind): string {
  switch (kind) {
    case 'stars':
      return translate({ id: 'homepage.projects.stat.stars', message: 'Stars' });
    case 'license':
      return translate({ id: 'homepage.projects.stat.license', message: 'License' });
    case 'release':
      return translate({ id: 'homepage.projects.stat.release', message: 'Latest release' });
  }
}

// Shields' JSON endpoints accept requests from any site and are cached for 30 minutes, so
// visitors don't use up GitHub's limit of 60 anonymous API requests an hour. Shields reports a
// private or missing repository, or one with no releases, as the value itself; those are left out.
function useRepoStats(repo: string): Stat[] {
  const [stats, setStats] = useState<Stat[]>([]);
  useEffect(() => {
    let cancelled = false;
    const kinds = Object.keys(statPaths) as StatKind[];
    Promise.all(
      kinds.map((kind) =>
        fetch(`https://img.shields.io/github/${statPaths[kind]}/${repo}.json`)
          .then((response) => (response.ok ? response.json() : null))
          .then((badge) =>
            typeof badge?.value === 'string' && !/not found|no releases|invalid|inaccessible/i.test(badge.value)
              ? { kind, value: badge.value }
              : null,
          )
          .catch(() => null),
      ),
    ).then((results) => {
      if (!cancelled) {
        setStats(results.filter((stat): stat is Stat => stat !== null));
      }
    });
    return () => {
      cancelled = true;
    };
  }, [repo]);
  return stats;
}

function statusLabel(status: Project['status']): string {
  return status === 'available'
    ? translate({ id: 'homepage.projects.status.available', message: 'Available' })
    : translate({ id: 'homepage.projects.status.planned', message: 'Planned' });
}

// The whole card links to the project's docs: the title's link stretches over the card, and the
// GitHub link sits above it.
export default function ProjectCard({ project }: { project: Project }) {
  const stats = useRepoStats(project.repo);
  return (
    <div className="relative flex flex-col rounded-lg border border-border bg-surface p-6 transition hover:border-accent hover:shadow-md focus-within:border-accent">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <h3 className="font-heading text-xl font-semibold">
            <Link
              to={project.docsHref}
              className="text-fg no-underline hover:no-underline after:absolute after:inset-0 after:rounded-lg">
              {project.name}
            </Link>
          </h3>
          <span className="rounded-full border border-border px-2 py-0.5 text-xs text-fg-muted">
            {statusLabel(project.status)}
          </span>
        </div>
        <Link
          href={`https://github.com/${project.repo}`}
          aria-label={translate(
            { id: 'homepage.projects.github', message: '{name} on GitHub' },
            { name: project.name },
          )}
          className="relative z-10 -m-1 p-1 text-fg-muted hover:text-fg">
          <MarkGithubIcon size={24} />
        </Link>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-fg-muted">{project.description}</p>
      <ul className="mt-auto flex min-h-5 list-none flex-wrap gap-x-4 gap-y-1 p-0 pt-2 font-mono text-xs text-fg-muted">
        {stats.map((stat) => {
          const StatIcon = statIcons[stat.kind];
          return (
            <li key={stat.kind} className="m-0 inline-flex items-center gap-1">
              <StatIcon size={16} />
              <span className="sr-only">{statLabel(stat.kind)}: </span>
              {stat.value}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
