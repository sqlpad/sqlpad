const _ = require('lodash');
const Users = require('./users');
const SchemaInfo = require('./schemaInfo');
const ResultCache = require('./resultCache');
const QueryHistory = require('./queryHistory');
const Queries = require('./queries');
const Connections = require('./connections');
const ConnectionAccesses = require('./connectionAccesses');
const QueryAcl = require('./queryAcl');

class Models {
  constructor(nedb, sequelizeDb, config) {
    this.users = new Users(nedb, sequelizeDb, config);
    this.schemaInfo = new SchemaInfo(nedb, sequelizeDb, config);
    this.resultCache = new ResultCache(nedb, sequelizeDb, config);
    this.queryHistory = new QueryHistory(nedb, sequelizeDb, config);
    this.queries = new Queries(nedb, sequelizeDb, config);
    this.connections = new Connections(nedb, sequelizeDb, config);
    this.connectionAccesses = new ConnectionAccesses(nedb, sequelizeDb, config);
    this.queryAcl = new QueryAcl(nedb, sequelizeDb, config);
  }

  /**
   * Find all queries that a user has access to.
   * This DOES NOT send associated query info at this time (acl and user object)
   * If user is an admin, get all queries
   * If user is NOT an admin, get queries created by user or that are shared
   *
   * This needs to merge queries, acl, and user data
   * Fetching all query/user/acl data is not ideal, but is probably okay for now
   * This will become problematic for large SQLPad environments
   * Eventually this can be a better SQL query once all data is moved to SQLite
   * @param {string} userId
   */
  async findQueriesForUser(userId) {
    const queries = await this.queries.findAll();
    const user = await this.users.findOneById(userId);

    // If user is an admin return all queries and avoid extra work
    if (user.role === 'admin') {
      return queries;
    }

    const queryAcls = await this.queryAcl.findAllByUserId(userId);
    const queryAclsByQueryId = _.groupBy(queryAcls, 'queryId');

    const usersQueries = queries.map(query => {
      const acl = queryAclsByQueryId[query._id] || [];

      // If user is the owner return it
      if (query.createdBy === user.email) {
        return query;
      }

      // If user has access via acl return it
      if (acl.length > 0) {
        return query;
      }

      // Otherwise user does not have access
      return null;
    });

    // The map() may have returned nulls,
    // which represent queries the user does not have access to
    return usersQueries.filter(query => Boolean(query));
  }

  /**
   * Finds query
   * @param {string} id - query id
   */
  async findQueryById(id) {
    const query = await this.queries.findOneById(id);
    let queryAcls = await this.queryAcl.findAllByQueryId(id);

    // queryAcl has userId, not email address
    // We need to get all user object and index for efficient lookups
    const users = await this.users.findAll();
    const usersById = _.keyBy(users, '_id');

    query.acl = queryAcls.map(queryAcl => {
      // TODO everyone const isn't real user and won't show up here
      queryAcl.user = usersById[queryAcls.userId];
      return queryAcl;
    });

    return query;
  }
}

module.exports = Models;
