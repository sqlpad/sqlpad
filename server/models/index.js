const makeUsers = require('./users');
const makeSchemaInfo = require('./schemaInfo');
const makeResultCache = require('./resultCache');
const makeQueryHistory = require('./queryHistory');
const makeQueries = require('./queries');
const makeConnections = require('./connections');
const makeConnectionAccesses = require('./connectionAccesses');

// TODO FIX ME - remove anything that depends on single instance from these utilities
// (clean up jobs and whatever else)
module.exports = function(nedb) {
  return {
    users: makeUsers(nedb),
    schemaInfo: makeSchemaInfo(nedb),
    resultCache: makeResultCache(nedb),
    queryHistory: makeQueryHistory(nedb),
    queries: makeQueries(nedb),
    connections: makeConnections(nedb),
    connectionAccesses: makeConnectionAccesses(nedb)
  };
};
