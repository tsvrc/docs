import type { ReactNode } from 'react';
import Layout from '@theme/Layout';
import { translate } from '@docusaurus/Translate';
import Hero from '@site/src/components/homepage/Hero';
import TrustBar from '@site/src/components/homepage/TrustBar';
import Projects from '@site/src/components/homepage/Projects';

export default function Home(): ReactNode {
  return (
    <Layout
      title={translate({ id: 'homepage.meta.title', message: 'TsVRC' })}
      description={translate({
        id: 'homepage.meta.description',
        message: 'TsVRC builds open-source tools for VRChat world and avatar creators.',
      })}>
      <Hero />
      <TrustBar />
      <Projects />
    </Layout>
  );
}
