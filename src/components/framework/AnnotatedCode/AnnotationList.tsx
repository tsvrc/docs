import { usePrismTheme } from '@docusaurus/theme-common';
import useIsBrowser from '@docusaurus/useIsBrowser';
import { colorClasses, type Annotation } from '@site/src/components/framework/AnnotatedCode/annotations';

export default function AnnotationList({ annotations }: { annotations: Annotation[] }) {
  const prismTheme = usePrismTheme();
  const isBrowser = useIsBrowser();
  return (
    <dl
      style={isBrowser ? { background: prismTheme.plain.backgroundColor } : undefined}
      className="grid grid-cols-1 gap-x-6 gap-y-4 border-t border-border/30 bg-canvas-subtle p-4 sm:grid-cols-2">
      {annotations.map((a) => {
        const body = (
          <>
            <dt className={`font-mono text-xs font-semibold ${colorClasses[a.color].text}`}>{a.title}</dt>
            <dd className="mt-0.5 ml-0 text-xs leading-snug text-fg-muted">{a.description}</dd>
          </>
        );
        return (
          <div key={a.mark} className="flex gap-2">
            <span
              className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full font-body text-[10px] font-bold text-white ${colorClasses[a.color].badge}`}>
              {a.mark}
            </span>
            {a.href ? (
              <a href={a.href} className="no-underline hover:opacity-80">
                {body}
              </a>
            ) : (
              <div>{body}</div>
            )}
          </div>
        );
      })}
    </dl>
  );
}
