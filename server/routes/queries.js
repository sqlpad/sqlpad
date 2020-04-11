require('../typedefs');
const router = require('express').Router();
const mustBeAuthenticated = require('../middleware/must-be-authenticated.js');
const pushQueryToSlack = require('../lib/push-query-to-slack');
const decorateQueryUserAccess = require('../lib/decorate-query-user-access');
const wrap = require('../lib/wrap');

// NOTE: this non-api route is special since it redirects legacy urls
// TODO FIXME XXX REMOVE V5
router.get('/queries/:_id', mustBeAuthenticated, function(req, res, next) {
  const { query, params, config } = req;
  const { format } = query;
  const baseUrl = config.get('baseUrl');
  if (format === 'table') {
    return res.redirect(`${baseUrl}/query-table/${params._id}`);
  } else if (format === 'chart') {
    return res.redirect(`${baseUrl}/query-chart/${params._id}`);
  }
  next();
});

/**
 * @param {import('express').Request & Req} req
 * @param {*} res
 */
async function deleteQuery(req, res) {
  const { models, params, user } = req;
  const query = await models.findQueryById(params._id);
  if (!query) {
    return res.errors('Query not found', 404);
  }
  const decorated = decorateQueryUserAccess(query, user);
  if (decorated.canDelete) {
    await models.queries.removeById(params._id);
    await models.queryAcl.removeByQueryId(params._id);
    return res.data(null);
  }

  return res.errors('Access to query forbidden', 403);
}

router.delete('/api/queries/:_id', mustBeAuthenticated, wrap(deleteQuery));

/**
 * @param {import('express').Request & Req} req
 * @param {*} res
 */
async function listQueries(req, res) {
  const { models, user } = req;
  const queries = await models.findQueriesForUser(user);
  const decorated = queries.map(query => decorateQueryUserAccess(query, user));
  return res.data(decorated);
}

router.get('/api/queries', mustBeAuthenticated, wrap(listQueries));

/**
 * @param {import('express').Request & Req} req
 * @param {*} res
 */
async function getQuery(req, res) {
  const { models, user, params } = req;
  const query = await models.findQueryById(params._id);

  if (!query) {
    return res.errors('Query not found', 404);
  }

  const decorated = decorateQueryUserAccess(query, user);
  if (decorated.canRead) {
    return res.data(decorated);
  }

  return res.errors('Access to query forbidden', 403);
}

router.get('/api/queries/:_id', mustBeAuthenticated, wrap(getQuery));

/**
 * @param {import('express').Request & Req} req
 * @param {*} res
 */
async function createQuery(req, res) {
  const { models, body, user } = req;
  const { name, tags, connectionId, queryText, chartConfiguration, acl } = body;
  const { email } = user;

  const query = {
    name: name || 'No Name Query',
    tags,
    connectionId,
    queryText,
    chartConfiguration,
    createdBy: email,
    modifiedBy: email,
    acl
  };

  const newQuery = await models.upsertQuery(query);

  // This is async, but save operation doesn't care about when/if finished
  pushQueryToSlack(req.config, newQuery);

  return res.data(decorateQueryUserAccess(newQuery, user));
}

router.post('/api/queries', mustBeAuthenticated, wrap(createQuery));

/**
 * @param {import('express').Request & Req} req
 * @param {*} res
 */
async function updateQuery(req, res) {
  const { models, params, user, body } = req;

  const query = await models.findQueryById(params._id);
  if (!query) {
    return res.errors('Query not found', 404);
  }

  const decorated = decorateQueryUserAccess(query, user);

  if (!decorated.canWrite) {
    return res.errors('Access to query forbidden', 403);
  }

  const { name, tags, connectionId, queryText, chartConfiguration, acl } = body;

  Object.assign(query, {
    name,
    tags,
    connectionId,
    queryText,
    chartConfiguration,
    modifiedBy: user.email,
    acl
  });

  const updatedQuery = await models.upsertQuery(query);
  const data = decorateQueryUserAccess(updatedQuery, user);
  return res.data(data);
}

router.put('/api/queries/:_id', mustBeAuthenticated, wrap(updateQuery));

module.exports = router;
