const Users = require('./users');
const SchemaInfo = require('./schemaInfo');
const ResultCache = require('./resultCache');
const makeQueryHistory = require('./queryHistory');
const makeQueries = require('./queries');
const makeConnections = require('./connections');
const ConnectionAccesses = require('./connectionAccesses');

module.exports = function(nedb) {
  return {
    users: new Users(nedb),
    schemaInfo: new SchemaInfo(nedb),
    resultCache: new ResultCache(nedb),
    queryHistory: makeQueryHistory(nedb),
    queries: makeQueries(nedb),
    connections: makeConnections(nedb),
    connectionAccesses: new ConnectionAccesses(nedb)
  };
};
