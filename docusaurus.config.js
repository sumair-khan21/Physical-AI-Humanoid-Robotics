// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@docusaurus/module-type-aliases`)

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Physical AI & Humanoid Robotics',
  tagline: 'A comprehensive guide to ROS 2, simulation, NVIDIA Isaac, and AI-driven robotics',
  favicon: 'img/favicon.png',

  // Set the production url of your site here
  url: 'https://physical-ai-humanoid-robotics-blond-eta.vercel.app',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For Vercel deployment, use '/'
  baseUrl: '/',

  // Add the progress bar and scroll-to-top client modules
  clientModules: [
    require.resolve('./src/client-modules/progressBar.js'),
    require.resolve('./src/client-modules/scrollToTop.js'),
  ],

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'sumair-khan21', // Usually your GitHub org/user name.
  projectName: 'my-research-paper', // Usually your repo name.
  deploymentBranch: 'gh-pages',
  trailingSlash: true,

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  customFields: {
    // Backend URL for ChatWidget (HF Space deployment)
    backendURL: process.env.BACKEND_URL || 'https://sums2121-rag-chatbot-backend.hf.space',
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/sumair-khan21/Physical-AI-Humanoid-Robotics/tree/main/',
        },
        blog: false, // Disable blog for this textbook
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  plugins: [
    [
      '@docusaurus/plugin-ideal-image',
      {
        quality: 85,
        max: 2000,
        min: 500,
        steps: 4,
        disableInDev: false,
      },
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/docusaurus-social-card.jpg',
      navbar: {
        title: 'Physical AI & Humanoid Robotics',
        logo: {
          alt: 'Physical AI Logo',
          src: 'img/logo_transparent.png',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Textbook',
          },
          {
            href: 'https://github.com/sumair-khan21/Physical-AI-Humanoid-Robotics',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Modules',
            items: [
              {
                label: 'Module 1: ROS 2',
                to: '/docs/category/module-1-ros-2',
              },
              {
                label: 'Module 2: Digital Twin',
                to: '/docs/category/module-2-digital-twin',
              },
              {
                label: 'Module 3: NVIDIA Isaac',
                to: '/docs/category/module-3-nvidia-isaac',
              },
            ],
          },
          {
            title: 'Resources',
            items: [
              {
                label: 'ROS 2 Documentation',
                href: 'https://docs.ros.org/en/humble/',
              },
              {
                label: 'NVIDIA Isaac Sim',
                href: 'https://docs.omniverse.nvidia.com/isaacsim/',
              },
              {
                label: 'Gazebo',
                href: 'https://gazebosim.org/docs',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/sumair-khan21/Physical-AI-Humanoid-Robotics',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Physical AI & Humanoid Robotics. Built with Docusaurus.`,
      },
      prism: {
        theme: require('prism-react-renderer').themes.github,
        darkTheme: require('prism-react-renderer').themes.dracula,
        additionalLanguages: ['python', 'cpp', 'bash', 'yaml', 'json'],
      },
      algolia: {
        // The application ID provided by Algolia
        appId: 'YOUR_APP_ID',
        // Public API key: it is safe to commit it
        apiKey: 'YOUR_SEARCH_API_KEY',
        indexName: 'YOUR_INDEX_NAME',
        // Optional: see doc section below
        contextualSearch: true,
        // Optional: Algolia search parameters
        searchParameters: {},
        // Optional: path for search page that enabled by default (`false` to disable it)
        searchPagePath: 'search',
      },
      colorMode: {
        defaultMode: 'dark',
        disableSwitch: false,
        respectPrefersColorScheme: true,
      },
      metadata: [
        { name: 'keywords', content: 'robotics, ROS 2, humanoid robotics, physical AI, NVIDIA Isaac, simulation, Gazebo' },
        { name: 'description', content: 'Comprehensive textbook on Physical AI and Humanoid Robotics covering ROS 2, simulation, perception, and AI integration' },
        { property: 'og:title', content: 'Physical AI & Humanoid Robotics Textbook' },
        { property: 'og:description', content: 'Learn ROS 2, simulation, NVIDIA Isaac, and AI-driven robotics development' },
        { property: 'og:type', content: 'website' },
      ],
    }),
};

export default config;
