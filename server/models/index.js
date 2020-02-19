const makeUsers = require('./users');
const makeSchemaInfo = require('./schemaInfo');
const makeResultCache = require('./resultCache');
const makeQueryHistory = require('./queryHistory');
const makeQueries = require('./queries');
const makeConnections = require('./connections');
const makeConnectionAccesses = require('./connectionAccesses');

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
