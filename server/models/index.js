import Batches from './batches.js';
import ConnectionAccesses from './connection-accesses.js';
import ConnectionClients from './connection-clients.js';
import Connections from './connections.js';
import Queries from './queries.js';
import QueryHistory from './query-history.js';
import SchemaInfo from './schema-info.js';
import ServiceTokens from './service-tokens.js';
import Statements from './statements.js';
import Tags from './tags.js';
import Users from './users.js';

/**
 * Models today is a perhaps best thought of as a data-access-layer
 * or collection of utility functions for the high level compound objects in SQLPad.
 * These functions wrap complex ORM (sequelize) interactions involving one or more tables.
 *
 * Any direct use of sequelize should be limited to the following:
 *   - initial setup
 *   - these model functions
 *   - migrations
 *   - tests
 *
 * The functions may reach out beyond their own boundaries,
 * and are not a 1-to-1 mapping between objects and tables.
 *
 * For example, there are functions under the `tags` property,
 * but the `queries` property has plenty of functions
 * that look to and modify the tags table as well.
 */
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

export default Models;
