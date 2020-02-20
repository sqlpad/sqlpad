const Users = require('./users');
const makeSchemaInfo = require('./schemaInfo');
const makeResultCache = require('./resultCache');
const makeQueryHistory = require('./queryHistory');
const makeQueries = require('./queries');
const makeConnections = require('./connections');
const ConnectionAccesses = require('./connectionAccesses');

module.exports = function(nedb) {
  return {
    users: new Users(nedb),
    schemaInfo: makeSchemaInfo(nedb),
    resultCache: makeResultCache(nedb),
    queryHistory: makeQueryHistory(nedb),
    queries: makeQueries(nedb),
    connections: makeConnections(nedb),
    connectionAccesses: new ConnectionAccesses(nedb)
  };
};
