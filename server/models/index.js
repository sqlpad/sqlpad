const Batches = require('./batches');
const ConnectionAccesses = require('./connection-accesses');
const ConnectionClients = require('./connection-clients');
const Connections = require('./connections');
const Queries = require('./queries');
const QueryHistory = require('./query-history');
const SchemaInfo = require('./schema-info');
const ServiceTokens = require('./service-tokens');
const Statements = require('./statements');
const Tags = require('./tags');
const Users = require('./users');

class Models {
  constructor(sequelizeDb, config) {
    this.sequelizeDb = sequelizeDb;
    this.batches = new Batches(sequelizeDb, config);
    this.connectionAccesses = new ConnectionAccesses(sequelizeDb, config);
    this.connectionClients = new ConnectionClients(sequelizeDb, config);
    this.connections = new Connections(sequelizeDb, config);
    this.queries = new Queries(sequelizeDb, config);
    this.queryHistory = new QueryHistory(sequelizeDb, config);
    this.schemaInfo = new SchemaInfo(sequelizeDb, config);
    this.serviceTokens = new ServiceTokens(sequelizeDb, config);
    this.statements = new Statements(sequelizeDb, config);
    this.tags = new Tags(sequelizeDb, config);
    this.users = new Users(sequelizeDb, config);
  }
}

module.exports = Models;
