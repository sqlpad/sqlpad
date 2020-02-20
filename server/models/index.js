const Users = require('./users');
const SchemaInfo = require('./schemaInfo');
const ResultCache = require('./resultCache');
const QueryHistory = require('./queryHistory');
const Queries = require('./queries');
const Connections = require('./connections');
const ConnectionAccesses = require('./connectionAccesses');

class Models {
  constructor(nedb, config) {
    this.users = new Users(nedb, config);
    this.schemaInfo = new SchemaInfo(nedb, config);
    this.resultCache = new ResultCache(nedb, config);
    this.queryHistory = new QueryHistory(nedb, config);
    this.queries = new Queries(nedb, config);
    this.connections = new Connections(nedb, config);
    this.connectionAccesses = new ConnectionAccesses(nedb, config);
  }
}

module.exports = Models;
