require('../typedefs');
const { QueryTypes } = require('sequelize');
const _ = require('lodash');
const formatLinkHeader = require('format-link-header');
const queryString = require('query-string');
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
//   <columns>
// FROM
//   queries
// WHERE
//   connection_id = 'connection_id'
//   AND created_by = 'user_id'
//   -- for access (if not admin)
//   AND (
//     created_by = loggedInUserId
//     OR id IN (
//       SELECT query_id FROM query_acl WHERE group_id = '__EVERYONE__' OR user_id = 'userId' OR user_email = 'user_email'
//     )
//   )
//   -- for tags
//   AND id IN (SELECT query_id FROM query_tags WHERE tag = 'tag1')
//   AND id IN (SELECT query_id FROM query_tags WHERE tag = 'tag2')
//   -- for search
//   AND (name LIKE '%search%' OR query_text LIKE '%search%')
// ORDER BY
//   name ASC
//   -- updated_at DESC

/**
 * @param {Req} req
 * @param {Res} res
 */
async function listQueries(req, res) {
  const { models, user, query, config } = req;
  const {
    connectionId,
    tags,
    search,
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
      queries.query_text,
      queries.connection_id,
      connections.name AS connection_name,
      connections.driver AS connection_driver,
      queries.created_by AS created_by_user_id,
      users.name AS created_by_user_name,
      users.email AS created_by_user_email
    FROM
      queries
      LEFT JOIN connections ON queries.connection_id = connections.id
      LEFT JOIN users ON queries.created_by = users.id
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
      whereSqls.push('queries.created_by = :userId');
    } else if (ownedByUser === 'false') {
      whereSqls.push('queries.created_by != :userId');
    }
    params.userId = user.id;
  }

  if (tags) {
    tags.forEach((tag, index) => {
      let repKey = `tag_${index}`;
      const repValue = tag;
      params[repKey] = repValue;
      whereSqls.push(`
      queries.id IN ( 
        SELECT qt.query_id 
        FROM query_tags qt 
        WHERE qt.tag = :${repKey} 
      )`);
    });
  }

  // If not admin restrict to ACL rules
  // User can see queries they've created, or queries they have access to via ACL
  if (user.role !== 'admin') {
    whereSqls.push(`
      queries.created_by = :userId
      OR queries.id IN ( 
        SELECT qa.query_id 
        FROM query_acl qa 
        WHERE 
          qa.group_id = '__EVERYONE__' 
          OR user_id = :userId
      )
    `);
    params.userId = user.id;
  }

  if (search) {
    params.search = `%${search}%`;
    whereSqls.push(
      `( queries.name LIKE :search OR queries.query_text LIKE :search )`
    );
  }

  if (whereSqls.length > 0) {
    sql += ' WHERE ' + whereSqls.map((sql) => `(${sql})`).join(' AND ');
  }

  // sortBy takes direction (+/-) and fieldname of either +name, or -updatedAt
  let sortByDirection = 'ASC';
  let sortByField = 'name';
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

  // sortByField is validated, no concern for SQL injection here
  sql += ` ORDER BY queries.${
    sortByField === 'updatedAt' ? 'updated_at' : 'name'
  } ${sortByDirection}`;

  const parsedOffset = parseInt(offset, 10) || 0;
  const parsedLimit = parseInt(limit, 10);

  if (config.get('backendDatabaseUri').startsWith('mssql')) {
    if (limit) {
      sql += `
        OFFSET ${parsedOffset} ROWS
        FETCH NEXT ${parsedLimit} ROWS ONLY
      `;
    }
  } else {
    if (limit) {
      sql += ` LIMIT ${parsedLimit}`;
    }
    if (offset) {
      sql += ` OFFSET ${parsedOffset}`;
    }
  }

  let queries = await models.sequelizeDb.sequelize.query(sql, {
    type: QueryTypes.SELECT,
    replacements: params,
  });

  queries = queries.map((query) => {
    return {
      id: query.id,
      name: query.name,
      chart: typeof query.chart === 'string' ? JSON.parse(query.chart) : null,
      queryText: query.query_text,
      connection: {
        id: query.connection_id,
        name: query.connection_name,
        driver: query.connection_driver,
      },
      createdBy: query.created_by_user_id,
      createdByUser: {
        id: query.created_by_user_id,
        name: query.created_by_user_name,
        email: query.created_by_user_email,
      },
    };
  });
  const queryIds = queries.map((query) => query.id);

  let queryTags = await models.sequelizeDb.QueryTags.findAll({
    attributes: ['queryId', 'tag'],
    where: { queryId: queryIds },
  });
  queryTags = queryTags.map((qt) => qt.toJSON());
  const queryTagsByQueryId = _.groupBy(queryTags, 'queryId');

  let acl = await models.sequelizeDb.QueryAcl.findAll({
    where: { queryId: queryIds },
  });
  acl = acl.map((acl) => acl.toJSON());
  const aclByQueryId = _.groupBy(acl, 'queryId');

  queries = queries.map((query) => {
    query.acl = aclByQueryId[query.id] || [];
    query.tags = queryTagsByQueryId[query.id] || [];
    query.tags = query.tags.map((t) => t.tag).sort();
    return query;
  });

  const decorated = queries.map((query) =>
    decorateQueryUserAccess(query, user)
  );

  const link = {};
  const limitNum = limit ? parseInt(limit, 10) : 0;
  const offsetNum = offset ? parseInt(offset, 10) : 0;
  if (offsetNum > 0) {
    link.prev = {
      rel: 'prev',
      url: `/api/queries?${queryString.stringify(
        { ...req.query, limit, offset: offsetNum - limitNum },
        { arrayFormat: 'bracket' }
      )}`,
    };
  }
  if (queries.length === limitNum) {
    link.next = {
      rel: 'next',
      url: `/api/queries?${queryString.stringify(
        { ...req.query, limit, offset: offsetNum + limitNum },
        { arrayFormat: 'bracket' }
      )}`,
    };
  }

  res.set('Link', formatLinkHeader(link));

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
  const { models, body, user, webhooks } = req;
  const { name, tags, connectionId, queryText, chart, acl } = body;

  const query = {
    name: name || 'No Name Query',
    tags,
    connectionId,
    queryText,
    chart,
    createdBy: user.id,
    updatedBy: user.id,
    acl,
  };

  const newQuery = await models.upsertQuery(query);

  let connection;
  if (connectionId) {
    connection = await models.connections.findOneById(connectionId);
  }

  webhooks.queryCreated(newQuery, connection);

  // This is async, but save operation doesn't care about when/if finished
  pushQueryToSlack(req.config, newQuery, user);

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
    updatedBy: user.id,
    acl,
  });

  const updatedQuery = await models.upsertQuery(query);
  const data = decorateQueryUserAccess(updatedQuery, user);
  return res.utils.data(data);
}

router.put('/api/queries/:id', mustBeAuthenticated, wrap(updateQuery));

module.exports = router;
