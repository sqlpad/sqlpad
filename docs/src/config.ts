export const SITE = {
  title: 'SQLPad',
  description:
    'Web-based SQL editor run in your own private cloud. Supports MySQL, Postgres, SQL Server, Vertica, Crate, ClickHouse, Trino, Presto, SAP HANA, Cassandra, BigQuery, SQLite, and more with ODBC',
  defaultLanguage: 'en_US',
};

export const OPEN_GRAPH = {
  image: {
    src: 'https://getsqlpad.com/images/screenshot.png',
    alt: 'A screenshot of SQLPad',
  },
  twitter: 'rickbergfalk',
};

// This is the type of the frontmatter you put in the docs markdown files.
export type Frontmatter = {
  title: string;
  description: string;
  layout: string;
  image?: { src: string; alt: string };
  dir?: 'ltr' | 'rtl';
  ogLocale?: string;
  lang?: string;
};

export const KNOWN_LANGUAGES = {
  English: 'en',
} as const;
export const KNOWN_LANGUAGE_CODES = Object.values(KNOWN_LANGUAGES);

// Uncomment this to add an "Edit this page" button to every page of documentation.
export const GITHUB_EDIT_URL = `https://github.com/sqlpad/sqlpad/tree/master/docs/`;

// Uncomment this to add an "Join our Community" button to every page of documentation.
// export const COMMUNITY_INVITE_URL = `https://astro.build/chat`;

// Uncomment this to enable site search.
// See "Algolia" section of the README for more information.
// export const ALGOLIA = {
//   indexName: 'XXXXXXXXXX',
//   appId: 'XXXXXXXXXX',
//   apiKey: 'XXXXXXXXXX',
// }

export type Sidebar = Record<
  (typeof KNOWN_LANGUAGE_CODES)[number],
  Record<string, { text: string; link: string }[]>
>;
export const SIDEBAR: Sidebar = {
  en: {
    Guide: [
      { text: 'Introduction', link: 'en/introduction' },
      { text: 'Getting Started', link: 'en/getting-started' },
      { text: 'Configuration', link: 'en/configuration' },
      { text: 'Connections', link: 'en/connections' },
      { text: 'Authentication', link: 'en/authentication' },
      { text: 'Seed Data', link: 'en/seed-data' },
      { text: 'Connection Templates', link: 'en/connection-templates' },
      { text: 'Logging', link: 'en/logging' },
      { text: 'Webhooks', link: 'en/webhooks' },
    ],
    API: [
      { text: 'Overview', link: 'en/api-overview' },
      { text: 'Batches and Statements', link: 'en/api-batches' },
      { text: 'Connection Schema', link: 'en/api-connection-schema' },
      { text: 'Queries', link: 'en/api-queries' },
    ],
  },
};
