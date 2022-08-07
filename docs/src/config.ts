export const SITE = {
  title: 'SQLPad',
  description: 'Web-based SQL editor run in your own private cloud. Supports MySQL, Postgres, SQL Server, Vertica, Crate, ClickHouse, Trino, Presto, SAP HANA, Cassandra, Snowflake, BigQuery, SQLite, and more with ODBC',
  defaultLanguage: 'en_US',
};

export const OPEN_GRAPH = {
  image: {
    src: 'https://getsqlpad.com/images/screenshot.png',
    alt: 'A screenshot of SQLPad',
  },
  twitter: 'rickbergfalk',
};

export const KNOWN_LANGUAGES = {
  English: 'en',
};

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
