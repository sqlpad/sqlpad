const Users = require('./users');
const SchemaInfo = require('./schemaInfo');
const ResultCache = require('./resultCache');
const QueryHistory = require('./queryHistory');
const Queries = require('./queries');
const Connections = require('./connections');
const ConnectionAccesses = require('./connectionAccesses');

class Models {
  constructor(nedb, sequelizeDb, config) {
    this.users = new Users(nedb, sequelizeDb, config);
    this.schemaInfo = new SchemaInfo(nedb, sequelizeDb, config);
    this.resultCache = new ResultCache(nedb, sequelizeDb, config);
    this.queryHistory = new QueryHistory(nedb, sequelizeDb, config);
    this.queries = new Queries(nedb, sequelizeDb, config);
    this.connections = new Connections(nedb, sequelizeDb, config);
    this.connectionAccesses = new ConnectionAccesses(nedb, sequelizeDb, config);
  }
}

module.exports = Models;
