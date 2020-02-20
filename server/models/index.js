const Users = require('./users');
const SchemaInfo = require('./schemaInfo');
const ResultCache = require('./resultCache');
const QueryHistory = require('./queryHistory');
const Queries = require('./queries');
const Connections = require('./connections');
const ConnectionAccesses = require('./connectionAccesses');

module.exports = function(nedb, config) {
  return {
    users: new Users(nedb, config),
    schemaInfo: new SchemaInfo(nedb, config),
    resultCache: new ResultCache(nedb, config),
    queryHistory: new QueryHistory(nedb, config),
    queries: new Queries(nedb, config),
    connections: new Connections(nedb, config),
    connectionAccesses: new ConnectionAccesses(nedb, config)
  };
};
