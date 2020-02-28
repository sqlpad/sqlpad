require('../typedefs');
const router = require('express').Router();
const mustBeAuthenticated = require('../middleware/must-be-authenticated.js');
const mustBeAuthenticatedOrChartLink = require('../middleware/must-be-authenticated-or-chart-link-noauth.js');
const sendError = require('../lib/sendError');
const pushQueryToSlack = require('../lib/pushQueryToSlack');
const consts = require('../lib/consts');

// NOTE: this non-api route is special since it redirects legacy urls
router.get('/queries/:_id', mustBeAuthenticatedOrChartLink, function(
  req,
  res,
  next
) {
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

    if (user.role === 'admin' || user.email === query.createdBy) {
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
    return res.json({ queries });
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

    // If user is admin or creator return it
    if (user.role === 'admin' || query.createdBy === user.email) {
      return res.json({ query });
    }

    // Otherwise user needs permission via ACL
    const foundAccess = query.acl.find(
      acl =>
        acl.groupId === consts.EVERYONE_ID ||
        acl.userId === user._id ||
        acl.userEmail === user.email
    );

    if (foundAccess) {
      return res.json({ query });
    }

    // TODO send 403 forbidden
    sendError(res, null, 'Access to query not permitted');
  } catch (error) {
    sendError(res, error, 'Problem getting query');
  }
}

router.get('/api/queries/:_id', mustBeAuthenticatedOrChartLink, getQuery);

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
      query: newQuery
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

    // Check to see if user has permission to do this
    const isCreator = query.createdBy === user.email;
    const isAdmin = user.role === 'admin';
    const hasAclWrite = query.acl
      .filter(acl => acl.write)
      .find(
        acl =>
          acl.groupId === consts.EVERYONE_ID ||
          acl.userId === user._id ||
          acl.userEmail === user.email
      );

    const hasPermission = hasAclWrite || isCreator || isAdmin;

    if (!hasPermission) {
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

    return res.json({ query: updatedQuery });
  } catch (error) {
    sendError(res, error, 'Problem saving query');
  }
}

router.put('/api/queries/:_id', mustBeAuthenticated, updateQuery);

module.exports = router;
