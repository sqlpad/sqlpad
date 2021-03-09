const Batches = require('./batches');
const ConnectionAccesses = require('./connection-accesses');
const ConnectionClients = require('./connection-clients');
const Connections = require('./connections');
const Queries = require('./queries');
const QueryAcl = require('./query-acl');
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
    this.queryAcl = new QueryAcl(sequelizeDb, config);
    this.queryHistory = new QueryHistory(sequelizeDb, config);
    this.schemaInfo = new SchemaInfo(sequelizeDb, config);
    this.serviceTokens = new ServiceTokens(sequelizeDb, config);
    this.statements = new Statements(sequelizeDb, config);
    this.tags = new Tags(sequelizeDb, config);
    this.users = new Users(sequelizeDb, config);
  }

  /**
   * Create or Update query
   * Remove existing query acl entries and add new ones if they should be added
   * TODO should probably validate userIds are valid
   * TODO should email be allowed here and be translated to userIds?
   * TODO add transaction support here once all models are in SQLite (this is risky otherwise)
   * @param {*} data
   */
  async upsertQuery(data) {
    const { acl, ...query } = data;
    let newOrUpdatedQuery;

    let exists = false;
    if (query.id) {
      const found = await this.queries.findOneById(query.id);
      exists = Boolean(found);
    }

    if (exists) {
      newOrUpdatedQuery = await this.queries.update(query.id, query);
    } else {
      newOrUpdatedQuery = await this.queries.create(query);
    }

    const queryId = newOrUpdatedQuery.id;

    await this.queryAcl.removeByQueryId(queryId);

    if (acl && acl.length) {
      const aclRows = acl.map((row) => {
        return {
          queryId,
          userId: row.userId,
          userEmail: row.userEmail,
          groupId: row.groupId,
          write: row.write,
        };
      });
      await this.queryAcl.bulkCreate(aclRows);
    }

    return this.queries.findOneById(queryId);
  }
}

module.exports = Models;
