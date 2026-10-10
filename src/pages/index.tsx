import type { ReactNode } from 'react';
import Layout from '@theme/Layout';
import { translate } from '@docusaurus/Translate';
import Hero from '@site/src/components/homepage/Hero';
import Projects from '@site/src/components/homepage/Projects';

export default function Home(): ReactNode {
  return (
    <Layout
      title={translate({ id: 'homepage.meta.title', message: 'TsVRC' })}
      description={translate({
        id: 'homepage.meta.description',
        message: "Toni's open-source tools for making VRChat worlds, published as TsVRC.",
      })}>
      <Hero />
      <Projects />
    </Layout>
  );
}
