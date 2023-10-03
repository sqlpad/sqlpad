const hashRedirects = {
  '#/getting-started': '/en/getting-started',
  '#/configuration': '/en/configuration',
  '#/connections': '/en/connections',
  '#/authentication': '/en/authentication',
  '#/seed-data': '/en/seed-data',
  '#/connection-templates': '/en/connection-templates',
  '#/logging': '/en/logging',
  '#/webhooks': '/en/webhooks',
  '#/api-overview': '/en/api-overview',
  '#/api-batches': '/en/api-batches',
  '#/api-connection-schema': '/en/api-connection-schema',
  '#/api-queries': '/en/api-queries',
};

// You know what we don't even need to wait til the page is loaded?
// We just need the URL and it'll always be there. lets go.
// Hash routing was a mistake.
const hashPage = window.location.hash.split('?')[0];
const redirect = hashRedirects[hashPage];
if (redirect) {
  window.location.replace(redirect);
}
