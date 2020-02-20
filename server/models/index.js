const Users = require('./users');
const SchemaInfo = require('./schemaInfo');
const ResultCache = require('./resultCache');
const QueryHistory = require('./queryHistory');
const Queries = require('./queries');
const Connections = require('./connections');
const ConnectionAccesses = require('./connectionAccesses');

module.exports = function(nedb) {
  return {
    users: new Users(nedb),
    schemaInfo: new SchemaInfo(nedb),
    resultCache: new ResultCache(nedb),
    queryHistory: new QueryHistory(nedb),
    queries: new Queries(nedb),
    connections: new Connections(nedb),
    connectionAccesses: new ConnectionAccesses(nedb)
  };
};
