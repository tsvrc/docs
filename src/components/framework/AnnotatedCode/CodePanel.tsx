import { Fragment } from 'react';
import { Highlight } from 'prism-react-renderer';
import { usePrismTheme } from '@docusaurus/theme-common';
import useIsBrowser from '@docusaurus/useIsBrowser';
import Badge from '@site/src/components/framework/AnnotatedCode/Badge';
import {
  colorClasses,
  exampleCode,
  findTokenRun,
  type Annotation,
} from '@site/src/components/framework/AnnotatedCode/annotations';

export default function CodePanel({ annotations }: { annotations: Annotation[] }) {
  const prismTheme = usePrismTheme();
  const isBrowser = useIsBrowser();
  const byLine = new Map(
    annotations.filter((a): a is Annotation & { line: number } => a.line !== undefined).map((a) => [a.line, a]),
  );
  return (
    <div
      className="bg-canvas-subtle"
      style={isBrowser ? { background: prismTheme.plain.backgroundColor } : undefined}>
      <div className="flex items-center justify-between border-b border-border/30 px-3 py-1.5">
        <span className="flex items-center gap-2 font-mono text-xs text-fg-muted">
          <span className="h-2 w-2 rounded-full bg-fg-muted/40" />
          HelloWorld.cs
        </span>
        <span className="font-mono text-[10px] text-fg-muted">C#</span>
      </div>
      {!isBrowser ? (
        // Avoid flashing the light Prism theme: colorMode (and so usePrismTheme) is
        // intentionally lagged on the first client render to prevent hydration mismatches
        // (see Docusaurus's own colorMode.tsx). Render plain, uncolored text until then.
        <pre className="m-0 overflow-x-auto p-3 text-sm text-fg">
          {exampleCode.split('\n').map((line, i) => (
            <div key={i} className="flex">
              <span className="mr-3 w-4 shrink-0 text-right text-fg-muted/40 select-none">{i + 1}</span>
              <span className="whitespace-pre">{line}</span>
            </div>
          ))}
        </pre>
      ) : (
        <Highlight theme={prismTheme} language="csharp" code={exampleCode}>
          {({ className, style, tokens, getLineProps, getTokenProps }) => (
            <pre className={`${className} m-0 overflow-x-auto p-3 text-sm`} style={style}>
              {tokens.map((line, i) => {
                const annotation = byLine.get(i);
                const run = annotation?.match ? findTokenRun(line, annotation.match) : null;
                const lineProps = getLineProps({ line });
                return (
                  <div key={i} {...lineProps} className={`${lineProps.className} flex`}>
                    <span className="mr-3 w-4 shrink-0 text-right text-fg-muted/40 select-none">{i + 1}</span>
                    <span className="whitespace-pre">
                      {line.map((token, key) => {
                        const tokenProps = getTokenProps({ token });
                        const inRun = !!run && key >= run[0] && key <= run[1];
                        if (!inRun) {
                          return <span key={key} {...tokenProps} />;
                        }

                        const isRunStart = key === run![0];
                        const isRunEnd = key === run![1];
                        let boxClass = `border-y ${colorClasses[annotation!.color].border}`;
                        boxClass += isRunStart ? ' rounded-l-sm border-l pl-0.5' : '';
                        boxClass += isRunEnd ? ' rounded-r-sm border-r pr-0.5' : '';

                        // The run's own leading indentation, if any, must stay outside the box
                        // (Prism merges a line's indentation into its first token's content).
                        let leadingWs = '';
                        let text = tokenProps.children as string;
                        if (isRunStart) {
                          const m = /^\s+/.exec(text);
                          if (m) {
                            leadingWs = m[0];
                            text = text.slice(leadingWs.length);
                          }
                        }

                        const boxed = (
                          <span
                            key={`${key}-boxed`}
                            className={`${tokenProps.className} ${boxClass}`}
                            style={tokenProps.style}>
                            {text}
                          </span>
                        );
                        const rendered = leadingWs ? (
                          <Fragment key={key}>
                            <span className={tokenProps.className} style={tokenProps.style}>
                              {leadingWs}
                            </span>
                            {boxed}
                          </Fragment>
                        ) : (
                          boxed
                        );

                        if (isRunEnd) {
                          return (
                            <Fragment key={key}>
                              {rendered}
                              <Badge mark={annotation!.mark} color={annotation!.color} />
                            </Fragment>
                          );
                        }
                        return rendered;
                      })}
                    </span>
                  </div>
                );
              })}
            </pre>
          )}
        </Highlight>
      )}
    </div>
  );
}
