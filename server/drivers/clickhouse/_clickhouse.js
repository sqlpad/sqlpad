const fetch = require('node-fetch');
const NEXT_URI_TIMEOUT = 100;

module.exports = { send };

// Util - setTimeout as a promise
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Get ClickHouse headers from config
function getHeaders(config) {
  const headers = {};
  if (config.password) {
    headers['X-ClickHouse-Key'] = config.password;
  }
  if (config.username) {
    headers['X-ClickHouse-User'] = config.username;
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
  return fetch(
    `${config.url}/?user=${config.user}&password=${config.password}&database=${config.database}`,
    {
      method: 'POST',
      body: query,
      headers: getHeaders(config),
    }
  )
    .then((response) => response.json())
    .then((statement) => handleStatementAndGetMore(results, statement, config));
}

function updateResults(results, statement) {
  if (statement.data && statement.data.length) {
    results.data = results.data.concat(statement.data);
  }
  if (statement.meta) {
    results.columns = statement.meta;
  }
  return results;
}

function handleStatementAndGetMore(results, statement, config) {
  if (statement.error) {
    // A lot of other error data available,
    // but error.message contains the detail on syntax issue
    return Promise.reject(statement.error.message);
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
