require('../typedefs');
const { QueryTypes } = require('sequelize');
const _ = require('lodash');
const router = require('express').Router();
const mustBeAuthenticated = require('../middleware/must-be-authenticated.js');
const pushQueryToSlack = require('../lib/push-query-to-slack');
const decorateQueryUserAccess = require('../lib/decorate-query-user-access');
const wrap = require('../lib/wrap');

/**
 * @param {Req} req
 * @param {Res} res
 */
async function deleteQuery(req, res) {
  const { models, params, user } = req;
  const query = await models.findQueryById(params.id);
  if (!query) {
    return res.utils.notFound();
  }
  const decorated = decorateQueryUserAccess(query, user);
  if (decorated.canDelete) {
    await models.queries.removeById(params.id);
    await models.queryAcl.removeByQueryId(params.id);
    return res.utils.data();
  }

  return res.utils.forbidden();
}

router.delete('/api/queries/:id', mustBeAuthenticated, wrap(deleteQuery));

// Target SQL query to be built
//
// SELECT
//   *
// FROM
//   queries
// WHERE
//   connection_id = 'connection_id'
//   AND created_by = 'user_id'
//   -- for access (if not admin)
//   AND id IN (
//     SELECT query_id FROM query_acl WHERE group_id = '__EVERYONE__' OR user_id = 'userId' OR user_email = 'user_email'
//   )
//   -- for tags
//   AND id IN (
//     SELECT query_id FROM query_tags WHERE tag = 'tag1'
//     INTERSECT
//     SELECT query_id FROM query_tags WHERE tag = 'tag2'
//     INSERSECT
//     SELECT query_id FROM query_tags WHERE tag = 'tag3'
//   )
//   -- for each search term
//   AND (name LIKE '%term1%' OR query_text LIKE '%term1%')
//   AND (name LIKE '%term2%' OR query_text LIKE '%term2%')
// ORDER BY
//   name
//   -- updated_at DESC

/**
 * @param {Req} req
 * @param {Res} res
 */
async function listQueries(req, res) {
  const { models, user, query } = req;
  const {
    connectionId,
    tags,
    searches,
    createdBy,
    sortBy,
    ownedByUser,
    limit = 100,
    offset = 0,
  } = query;

  let sql = `
    SELECT
      queries.id,
      queries.name,
      queries.chart,
      queries.connection_id,
      connections.name AS connection_name,
      connections.driver AS connection_driver
    FROM
      queries
      LEFT JOIN connections ON queries.connection_id = connections.id
  `;
  const whereSqls = [];
  const params = {};
  if (connectionId) {
    whereSqls.push('queries.connection_id = :connectionId');
    params.connectionId = connectionId;
  }
  if (createdBy) {
    whereSqls.push('queries.created_by = :createdBy');
    params.createdBy = createdBy;
  }

  if (typeof ownedByUser === 'string') {
    if (ownedByUser === 'true') {
      whereSqls.push('queries.created_by = :loggedInUserEmail');
    } else if (ownedByUser === 'false') {
      whereSqls.push('queries.created_by != :loggedInUserEmail');
    }
    params.loggedInUserEmail = user.email;
  }

  if (tags) {
    const tagSqls = [];
    tags.forEach((tag, index) => {
      let repKey = `tag_${index}`;
      const repValue = `%${tag}%`;
      params[repKey] = repValue;
      tagSqls.push(`
        SELECT qt.query_id 
        FROM query_tags qt 
        WHERE qt.tag = :${repKey}
      `);
    });
    whereSqls.push(`queries.id IN ( ${tagSqls.join(' INSTERSECT ')} )`);
  }

  if (user.role !== 'admin') {
    whereSqls.push(`
      queries.id IN ( 
        SELECT qa.query_id 
        FROM query_acl qa 
        WHERE 
          qa.group_id = '__EVERYONE__' 
          OR user_id = :userId 
          OR user_email = :userEmail 
      )
    `);
    params.userEmail = user.email;
    params.userId = user.id;
  }

  if (searches && searches.length > 0) {
    searches.forEach((search, index) => {
      const repKey = `search_${index}`;
      const repValue = `%${search}%`;
      params[repKey] = repValue;
      whereSqls.push(
        `( queries.name LIKE :${repKey} OR queries.query_text LIKE :${repKey} )`
      );
    });
  }

  if (whereSqls.length > 0) {
    sql += ' WHERE ' + whereSqls.map((sql) => `(${sql})`).join(' AND ');
  }

  // sortBy takes direction (+/-) and fieldname of either +name, or -updatedAt
  let sortByDirection;
  let sortByField;
  if (sortBy && sortBy.startsWith('+')) {
    sortByDirection = 'ASC';
    sortByField = sortBy.slice(1);
  } else if (sortBy && sortBy.startsWith('-')) {
    sortByDirection = 'DESC';
    sortByField = sortBy.slice(1);
  } else if (sortBy) {
    sortByField = sortBy;
    sortByDirection = 'ASC';
  }
  const allowedSortByFields = ['name', 'updatedAt'];
  if (sortByField && !allowedSortByFields.includes(sortByField)) {
    return res.utils.error('sortBy field must be "name" or "updatedAt"');
  }
  if (sortByField) {
    // sortByField is validated, no concern for SQL injection here
    sql += ` ORDER BY queries.${sortByField} ${sortByDirection}`;
  }
  if (limit) {
    sql += ` LIMIT ${parseInt(limit, 10)}`;
  }
  if (offset) {
    sql += ` OFFSET ${parseInt(offset, 10)}`;
  }

  let queries = await models.sequelizeDb.sequelize.query(sql, {
    type: QueryTypes.SELECT,
    replacements: params,
  });

  queries = queries.map((query) => {
    return {
      id: query.id,
      name: query.name,
      chart: query.chart,
      connectionId: query.connection_id,
      connectionName: query.connection_name,
      connectionDriver: query.connection_driver,
    };
  });
  const queryIds = queries.map((query) => query.id);

  let acl = await models.sequelizeDb.QueryAcl.findAll({
    where: { queryId: queryIds },
  });
  acl = acl.map((acl) => acl.toJSON());
  const aclByQueryId = _.groupBy(acl, 'queryId');
  queries = queries.map((query) => {
    query.acl = aclByQueryId[query.id] || [];
    return query;
  });

  const decorated = queries.map((query) =>
    decorateQueryUserAccess(query, user)
  );
  return res.utils.data(decorated);
}

router.get('/api/queries', mustBeAuthenticated, wrap(listQueries));

/**
 * @param {Req} req
 * @param {Res} res
 */
async function getQuery(req, res) {
  const { models, user, params } = req;
  const query = await models.findQueryById(params.id);

  if (!query) {
    return res.utils.notFound();
  }

  const decorated = decorateQueryUserAccess(query, user);
  if (decorated.canRead) {
    return res.utils.data(decorated);
  }

  return res.utils.forbidden();
}

router.get('/api/queries/:id', mustBeAuthenticated, wrap(getQuery));

/**
 * @param {Req} req
 * @param {Res} res
 */
async function createQuery(req, res) {
  const { models, body, user } = req;
  const { name, tags, connectionId, queryText, chart, acl } = body;
  const { email } = user;

  const query = {
    name: name || 'No Name Query',
    tags,
    connectionId,
    queryText,
    chart,
    createdBy: email,
    updatedBy: email,
    acl,
  };

  const newQuery = await models.upsertQuery(query);

  // This is async, but save operation doesn't care about when/if finished
  pushQueryToSlack(req.config, newQuery);

  return res.utils.data(decorateQueryUserAccess(newQuery, user));
}

router.post('/api/queries', mustBeAuthenticated, wrap(createQuery));

/**
 * @param {Req} req
 * @param {Res} res
 */
async function updateQuery(req, res) {
  const { models, params, user, body } = req;

  const query = await models.findQueryById(params.id);
  if (!query) {
    return res.utils.notFound();
  }

  const decorated = decorateQueryUserAccess(query, user);

  if (!decorated.canWrite) {
    return res.utils.forbidden();
  }

  const { name, tags, connectionId, queryText, chart, acl } = body;

  Object.assign(query, {
    name,
    tags,
    connectionId,
    queryText,
    chart,
    updatedBy: user.email,
    acl,
  });

  const updatedQuery = await models.upsertQuery(query);
  const data = decorateQueryUserAccess(updatedQuery, user);
  return res.utils.data(data);
}

router.put('/api/queries/:id', mustBeAuthenticated, wrap(updateQuery));

module.exports = router;
