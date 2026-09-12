import type { ReactNode } from 'react';
import Layout from '@theme/Layout';
import { translate } from '@docusaurus/Translate';
import Hero from '@site/src/components/framework/Hero';
import ProblemSolution from '@site/src/components/framework/ProblemSolution';
import Features from '@site/src/components/framework/Features';
import GetStarted from '@site/src/components/framework/GetStarted';

export default function Framework(): ReactNode {
  return (
    <Layout
      title={translate({ id: 'framework.meta.title', message: 'TsVRC Core' })}
      description={translate({
        id: 'framework.meta.description',
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
