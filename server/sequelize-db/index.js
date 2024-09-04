import path from 'path';
import { Sequelize } from 'sequelize';
import appLog from '../lib/app-log.js';
import queryAcl from './query-acl.js';
import serviceTokens from './service-tokens.js';
import queries from './queries.js';
import queryTags from './query-tags.js';
import connections from './connections.js';
import users from './users.js';
import queryHistory from './query-history.js';
import connectionsAccesses from './connections-accesses.js';
import cache from './cache.js';
import batches from './batches.js';
import statements from './statements.js';
import sessions from './sessions.js';

// Sequelize logging function
function logging(message) {
  appLog.debug(message);
}

class SequelizeDb {
  constructor(config) {
    this.config = config;

    // As of Sequelize 5.21.11
    // Sequelize & SQLite on Windows may error with `SQLITE_CANTOPEN: unable to open database file`
    // if sqlite connection string is provided as a URI
    // If backendDatabaseUri is not set, we fall back to a SQLite specific sequelize config
    let sequelize;
    if (config.get('backendDatabaseUri')) {
      sequelize = new Sequelize(config.get('backendDatabaseUri'), {
        logging,
      });
    } else {
      sequelize = new Sequelize({
        dialect: 'sqlite',
        logging,
        storage: config.get('dbInMemory')
          ? ':memory:'
          : path.join(config.get('dbPath'), 'sqlpad.sqlite'),
      });
    }

    this.sequelize = sequelize;
    this.Sequelize = Sequelize;

    this.QueryAcl = queryAcl(sequelize);
    this.ServiceTokens = serviceTokens(sequelize);
    this.Queries = queries(sequelize);
    this.QueryTags = queryTags(sequelize);
    this.Connections = connections(sequelize);
    this.Users = users(sequelize);
    this.QueryHistory = queryHistory(sequelize);
    this.ConnectionAccesses = connectionsAccesses(sequelize);
    this.Cache = cache(sequelize);
    this.Batches = batches(sequelize);
    this.Statements = statements(sequelize);
    this.Sessions = sessions(sequelize);
  }
}

export default SequelizeDb;
