import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'TsVRC',
  tagline: 'A community-maintained framework for building VRChat worlds',
  favicon: 'img/tsvrc-logo.png',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://tsvrc.com',
  // Set the /<baseUrl>/ pathname under which your site is served
  baseUrl: '/',

  // GitHub pages deployment config.
  organizationName: 'tsvrc',
  projectName: 'docs',

  onBrokenLinks: 'throw',

  markdown: {
    mermaid: true,
  },
  themes: [
    '@docusaurus/theme-mermaid',
    [
      // Builds the search index at build time, so search works on GitHub Pages with no
      // external service.
      '@easyops-cn/docusaurus-search-local',
      {
        hashed: true,
        language: ['en', 'es'],
        indexBlog: false,
        explicitSearchResultPath: true,
        highlightSearchTermsOnTargetPage: true,
      },
    ],
  ],

  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es'],
    localeConfigs: {
      en: { label: 'English', htmlLang: 'en' },
      es: { label: 'Español', htmlLang: 'es' },
    },
  },

  plugins: ['./src/plugins/plugin-tailwind.ts'],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/tsvrc/docs/tree/main/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'TsVRC',
      logo: {
        alt: 'TsVRC logo',
        src: 'img/tsvrc-logo.png',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Docs',
        },
        {
          href: 'https://github.com/tsvrc',
          label: 'GitHub',
          position: 'right',
        },
        {
          to: '/support',
          label: 'Support',
          position: 'right',
        },
        {
          type: 'localeDropdown',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          label: 'Docs',
          to: '/docs/core/intro',
        },
        {
          label: 'GitHub',
          href: 'https://github.com/tsvrc',
        },
        {
          label: 'Support',
          to: '/support',
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} TsVRC. Not affiliated with or endorsed by VRChat Inc.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['csharp'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
