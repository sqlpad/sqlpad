require('../typedefs');
const router = require('express').Router();
const mustBeAuthenticated = require('../middleware/must-be-authenticated.js');
const sendError = require('../lib/send-error');
const pushQueryToSlack = require('../lib/push-query-to-slack');
const decorateQueryUserAccess = require('../lib/decorate-query-user-access');

// NOTE: this non-api route is special since it redirects legacy urls
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
  try {
    const query = await models.queries.findOneById(params._id);
    if (!query) {
      return sendError(res, null, 'Query not found');
    }

    const decorated = decorateQueryUserAccess(query, user);

    if (decorated.canDelete) {
      await models.queries.removeById(params._id);
      await models.queryAcl.removeByQueryId(params._id);
      return res.json({});
    }

    // TODO send 403 forbidden
    sendError(res, null, 'Access to query not permitted');
  } catch (error) {
    sendError(res, error, 'Problem deleting query');
  }
}

router.delete('/api/queries/:_id', mustBeAuthenticated, deleteQuery);

/**
 * @param {import('express').Request & Req} req
 * @param {*} res
 */
async function listQueries(req, res) {
  const { models, user } = req;
  try {
    const queries = await models.findQueriesForUser(user);
    return res.json({
      queries: queries.map(query => decorateQueryUserAccess(query, user))
    });
  } catch (error) {
    sendError(res, error, 'Problem querying query database');
  }
}

router.get('/api/queries', mustBeAuthenticated, listQueries);

/**
 * @param {import('express').Request & Req} req
 * @param {*} res
 */
async function getQuery(req, res) {
  const { models, user, params } = req;
  try {
    const query = await models.findQueryById(params._id);

    // TODO send proper 404
    // Leaving this in until all APIs are fixed up
    if (!query) {
      return res.json({
        query: {}
      });
    }

    const decorated = decorateQueryUserAccess(query, user);
    if (decorated.canRead) {
      return res.json({ query: decorated });
    }

    // TODO send 403 forbidden
    sendError(res, null, 'Access to query not permitted');
  } catch (error) {
    sendError(res, error, 'Problem getting query');
  }
}

router.get('/api/queries/:_id', mustBeAuthenticated, getQuery);

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

  try {
    const newQuery = await models.upsertQuery(query);

    // This is async, but save operation doesn't care about when/if finished
    pushQueryToSlack(req.config, newQuery);

    return res.json({
      query: decorateQueryUserAccess(newQuery, user)
    });
  } catch (error) {
    sendError(res, error, 'Problem saving query');
  }
}

router.post('/api/queries', mustBeAuthenticated, createQuery);

/**
 * @param {import('express').Request & Req} req
 * @param {*} res
 */
async function updateQuery(req, res) {
  const { models, params, user, body } = req;
  try {
    const query = await models.findQueryById(params._id);
    if (!query) {
      return sendError(res, null, 'Query not found');
    }

    const decorated = decorateQueryUserAccess(query, user);

    if (!decorated.canWrite) {
      // TODO send 403 forbidden
      return sendError(res, null, 'Access to query not permitted');
    }

    const {
      name,
      tags,
      connectionId,
      queryText,
      chartConfiguration,
      acl
    } = body;

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

    return res.json({ query: decorateQueryUserAccess(updatedQuery, user) });
  } catch (error) {
    sendError(res, error, 'Problem saving query');
  }
}

router.put('/api/queries/:_id', mustBeAuthenticated, updateQuery);

module.exports = router;
