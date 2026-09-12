import { translate } from '@docusaurus/Translate';

export const exampleCode = `using Tsvrc.Core.Generated;

public class HelloWorld : TsBehaviour
{
    protected override void TsStart()
    {
        LogInfo("HelloWorld constructed.");
        _ts.Scoreboard.SetTrigger("Refresh");
        _ts.Memory.SetInt("greetings", 1);
    }
}`;

export type AnnotationColor = 'accent' | 'success' | 'attention' | 'purple';

export const colorClasses: Record<AnnotationColor, { badge: string; border: string; text: string }> = {
  accent: { badge: 'bg-accent-emphasis', border: 'border-accent', text: 'text-accent' },
  success: { badge: 'bg-success', border: 'border-success', text: 'text-success' },
  attention: { badge: 'bg-attention', border: 'border-attention', text: 'text-attention' },
  purple: {
    badge: 'bg-purple-500 dark:bg-purple-400',
    border: 'border-purple-500 dark:border-purple-400',
    text: 'text-purple-600 dark:text-purple-400',
  },
};

export type Annotation = {
  mark: number;
  line?: number;
  match?: string;
  color: AnnotationColor;
  title: string;
  description: string;
  href?: string;
};

export function useAnnotations(): Annotation[] {
  return [
    {
      mark: 1,
      line: 2,
      match: 'TsBehaviour',
      color: 'accent',
      title: translate({ id: 'framework.hero.annotation.behaviour.title', message: 'TsBehaviour' }),
      description: translate({
        id: 'framework.hero.annotation.behaviour.description',
        message: "The generated shadow class every script extends. It's what gives this behaviour its _ts reference.",
      }),
      href: '#building-blocks',
    },
    {
      mark: 2,
      line: 7,
      match: '_ts.Scoreboard',
      color: 'attention',
      title: translate({ id: 'framework.hero.annotation.globals.title', message: 'Globals' }),
      description: translate({
        id: 'framework.hero.annotation.globals.description',
        message: 'Any named scene object, reachable as _ts.Name from every behaviour, no dragging references by hand.',
      }),
      href: '#building-blocks',
    },
    {
      mark: 3,
      line: 8,
      match: '_ts.Memory',
      color: 'purple',
      title: translate({ id: 'framework.hero.annotation.memory.title', message: 'Memory' }),
      description: translate({
        id: 'framework.hero.annotation.memory.description',
        message: 'The shared key-value store, reachable as _ts.Memory from anywhere.',
      }),
      href: '#building-blocks',
    },
    {
      mark: 4,
      color: 'success',
      title: translate({ id: 'framework.hero.annotation.more.title', message: "That's not all" }),
      description: translate({
        id: 'framework.hero.annotation.more.description',
        message: "There's more where that came from. See the rest of TsVRC's building blocks below.",
      }),
      href: '#building-blocks',
    },
  ];
}

// Finds the contiguous run of Prism tokens whose concatenated content equals `target`,
// regardless of exactly how the grammar split it (e.g. "_ts", ".", "Scoreboard").
export function findTokenRun(line: { content: string }[], target: string): [number, number] | null {
  for (let start = 0; start < line.length; start++) {
    let acc = '';
    for (let end = start; end < line.length; end++) {
      // Prism merges a line's leading indentation into its first token's content, so the
      // start of a candidate run needs that whitespace stripped before comparing.
      const piece = end === start ? line[end].content.replace(/^\s+/, '') : line[end].content;
      acc += piece;
      if (acc === target) return [start, end];
      if (!target.startsWith(acc)) break;
    }
  }
  return null;
}
