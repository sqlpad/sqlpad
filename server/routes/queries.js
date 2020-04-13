require('../typedefs');
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
  const query = await models.findQueryById(params._id);
  if (!query) {
    return res.utils.notFound();
  }
  const decorated = decorateQueryUserAccess(query, user);
  if (decorated.canDelete) {
    await models.queries.removeById(params._id);
    await models.queryAcl.removeByQueryId(params._id);
    return res.utils.data();
  }

  return res.utils.forbidden();
}

router.delete('/api/queries/:_id', mustBeAuthenticated, wrap(deleteQuery));

/**
 * @param {Req} req
 * @param {Res} res
 */
async function listQueries(req, res) {
  const { models, user } = req;
  const queries = await models.findQueriesForUser(user);
  const decorated = queries.map(query => decorateQueryUserAccess(query, user));
  return res.utils.data(decorated);
}

router.get('/api/queries', mustBeAuthenticated, wrap(listQueries));

/**
 * @param {Req} req
 * @param {Res} res
 */
async function getQuery(req, res) {
  const { models, user, params } = req;
  const query = await models.findQueryById(params._id);

  if (!query) {
    return res.utils.notFound();
  }

  const decorated = decorateQueryUserAccess(query, user);
  if (decorated.canRead) {
    return res.utils.data(decorated);
  }

  return res.utils.forbidden();
}

router.get('/api/queries/:_id', mustBeAuthenticated, wrap(getQuery));

/**
 * @param {Req} req
 * @param {Res} res
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

  return res.utils.data(decorateQueryUserAccess(newQuery, user));
}

router.post('/api/queries', mustBeAuthenticated, wrap(createQuery));

/**
 * @param {Req} req
 * @param {Res} res
 */
async function updateQuery(req, res) {
  const { models, params, user, body } = req;

  const query = await models.findQueryById(params._id);
  if (!query) {
    return res.utils.notFound();
  }

  const decorated = decorateQueryUserAccess(query, user);

  if (!decorated.canWrite) {
    return res.utils.forbidden();
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
  return res.utils.data(data);
}

router.put('/api/queries/:_id', mustBeAuthenticated, wrap(updateQuery));

module.exports = router;
