import type { ReactNode } from 'react';
import Layout from '@theme/Layout';
import { translate } from '@docusaurus/Translate';
import Hero from '@site/src/components/support/Hero';
import Options from '@site/src/components/support/Options';

export default function Support(): ReactNode {
  return (
    <Layout
      title={translate({ id: 'support.meta.title', message: 'Support TsVRC' })}
      description={translate({
        id: 'support.meta.description',
        message: 'Support TsVRC on Patreon or Ko-fi.',
      })}>
      <Hero />
      <Options />
    </Layout>
  );
}
