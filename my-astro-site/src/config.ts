export const SITE = {
  title: 'Documentation',
  description: 'Your website description.',
  defaultLanguage: 'en_US',
};

export const OPEN_GRAPH = {
  image: {
    src: 'https://github.com/withastro/astro/blob/main/assets/social/banner.jpg?raw=true',
    alt:
      'astro logo on a starry expanse of space,' +
      ' with a purple saturn-like planet floating in the right foreground',
  },
  twitter: 'astrodotbuild',
};

export const KNOWN_LANGUAGES = {
  English: 'en',
};

// Uncomment this to add an "Edit this page" button to every page of documentation.
export const GITHUB_EDIT_URL = `https://github.com/sqlpad/sqlpad/blob/main/docs/`;

// Uncomment this to add an "Join our Community" button to every page of documentation.
// export const COMMUNITY_INVITE_URL = `https://astro.build/chat`;

// Uncomment this to enable site search.
// See "Algolia" section of the README for more information.
// export const ALGOLIA = {
//   indexName: 'XXXXXXXXXX',
//   appId: 'XXXXXXXXXX',
//   apiKey: 'XXXXXXXXXX',
// }

export const SIDEBAR = {
  en: [
    { text: 'Guide', header: true },
    { text: 'Introduction', link: 'en/introduction' },
    { text: 'Getting Started', link: 'en/getting-started' },
    { text: 'Configuration', link: 'en/configuration' },
    { text: 'Connections', link: 'en/connections' },
    { text: 'Authentication', link: 'en/authentication' },
    { text: 'Seed Data', link: 'en/seed-data' },
    { text: 'Connection Templates', link: 'en/connection-templates' },
    { text: 'Logging', link: 'en/logging' },
    { text: 'Webhooks', link: 'en/webhooks' },

    { text: 'API', header: true },
    { text: 'Overview', link: 'en/api-overview' },
    { text: 'Batches and Statements', link: 'en/api-batches' },
    { text: 'Connection Schema', link: 'en/api-connection-schema' },
    { text: 'Queries', link: 'en/api-queries' },
  ],
};
