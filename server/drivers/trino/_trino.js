import fetch from 'node-fetch';
const NEXT_URI_TIMEOUT = 100;

export default { send };

// Util - setTimeout as a promise
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Get Trino headers from config
function getHeaders(config) {
  const headers = { 'X-Trino-User': config.user };
  if (config.catalog) {
    headers['X-Trino-Catalog'] = config.catalog;
  }
  if (config.schema) {
    headers['X-Trino-Schema'] = config.schema;
  }
  return headers;
}

// Given config and query, returns promise with the results
function send(config, query) {
  if (!config.url) {
    return Promise.reject(new Error('config.url is required'));
  }
  const results = {
    data: [],
  };
  return fetch(`${config.url}/v1/statement`, {
    method: 'POST',
    body: query,
    headers: getHeaders(config),
  })
    .then((response) => response.json())
    .then((statement) => handleStatementAndGetMore(results, statement, config));
}

function updateResults(results, statement) {
  if (statement.data && statement.data.length) {
    results.data = results.data.concat(statement.data);
  }
  if (statement.columns) {
    results.columns = statement.columns;
  }
  return results;
}

function handleStatementAndGetMore(results, statement, config) {
  if (statement.error) {
    // A lot of other error data available,
    // but error.message contains the detail on syntax issue
    return Promise.reject(new Error(statement.error.message));
  }
  results = updateResults(results, statement);
  if (!statement.nextUri) {
    return Promise.resolve(results);
  }
  return wait(NEXT_URI_TIMEOUT)
    .then(() => fetch(statement.nextUri, { headers: getHeaders(config) }))
    .then((response) => response.json())
    .then((statement) => handleStatementAndGetMore(results, statement, config));
}
