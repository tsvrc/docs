import type { ReactNode } from 'react';
import Layout from '@theme/Layout';
import { translate } from '@docusaurus/Translate';
import Hero from '@site/src/components/core/Hero';
import ProblemSolution from '@site/src/components/core/ProblemSolution';
import Features from '@site/src/components/core/Features';
import GetStarted from '@site/src/components/core/GetStarted';

export default function Core(): ReactNode {
  return (
    <Layout
      title={translate({ id: 'core.meta.title', message: 'TsVRC Core' })}
      description={translate({
        id: 'core.meta.description',
        message:
          'TsVRC Core is a framework for building VRChat worlds with UdonSharp: structured initialization, dependency wiring, and editor codegen.',
      })}>
      <Hero />
      <ProblemSolution />
      <Features />
      <GetStarted />
    </Layout>
  );
}
