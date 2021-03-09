import { defineConfig } from 'vite';
import reactRefresh from '@vitejs/plugin-react-refresh';

// For each route prefix below, add proxy entry to http://localhost:3010
// Add another set with '/sqlpad' prefix, as that base url is used during dev/testing
// Previously this project use create-react-app, which automatically fell back to proxy for special cases
// With Vite, this needs to be more explicit
const PROXY_ROUTES = [
  '/api',
  '/statement-results',
  '/auth/saml',
  '/login/callback',
  '/auth/google',
  '/auth/oidc',
];

const PROXY_URL = 'http://localhost:3010';

const proxy: Record<string, string> = {};

PROXY_ROUTES.forEach((route) => {
  proxy[route] = PROXY_URL;
  proxy[`/sqlpad${route}`] = PROXY_URL;
});

// This wildcard route is used for the UI to figure out what the baseURL is for the app
// The UI is built without knowing this information
proxy['^/.*/api/app'] = PROXY_URL;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [reactRefresh()],
  server: {
    proxy,
  },
  build: {
    outDir: 'build',
  },
});
