const router = require('express').Router();
const getModels = require('../models');
const mustBeAuthenticated = require('../middleware/must-be-authenticated.js');
const mustBeAuthenticatedOrChartLink = require('../middleware/must-be-authenticated-or-chart-link-noauth.js');
const sendError = require('../lib/sendError');
const pushQueryToSlack = require('../lib/pushQueryToSlack');

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

router.delete('/api/queries/:_id', mustBeAuthenticated, async function(
  req,
  res
) {
  try {
    const models = getModels(req.nedb);
    await models.queries.removeById(req.params._id);
    return res.json({});
  } catch (error) {
    sendError(res, error, 'Problem deleting query');
  }
});

router.get('/api/queries', mustBeAuthenticated, async function(req, res) {
  try {
    const models = getModels(req.nedb);
    const queries = await models.queries.findAll();
    return res.json({ queries });
  } catch (error) {
    sendError(res, error, 'Problem querying query database');
  }
});

router.get('/api/queries/:_id', mustBeAuthenticatedOrChartLink, async function(
  req,
  res
) {
  try {
    const models = getModels(req.nedb);
    const query = await models.queries.findOneById(req.params._id);
    if (!query) {
      return res.json({
        query: {}
      });
    }
    return res.json({ query });
  } catch (error) {
    sendError(res, error, 'Problem getting query');
  }
});

router.post('/api/queries', mustBeAuthenticated, async function(req, res) {
  const { name, tags, connectionId, queryText, chartConfiguration } = req.body;
  const { email } = req.user;

  const query = {
    name: name || 'No Name Query',
    tags,
    connectionId,
    queryText,
    chartConfiguration,
    createdBy: email,
    modifiedBy: email
  };

  try {
    const models = getModels(req.nedb);
    const newQuery = await models.queries.save(query);
    // This is async, but save operation doesn't care about when/if finished
    pushQueryToSlack(req.config, newQuery);
    return res.json({
      query: newQuery
    });
  } catch (error) {
    sendError(res, error, 'Problem saving query');
  }
});

router.put('/api/queries/:_id', mustBeAuthenticated, async function(req, res) {
  try {
    const models = getModels(req.nedb);
    const query = await models.queries.findOneById(req.params._id);
    if (!query) {
      return sendError(res, null, 'Query not found');
    }

    const {
      name,
      tags,
      connectionId,
      queryText,
      chartConfiguration
    } = req.body;
    const { email } = req.user;

    Object.assign(query, {
      name,
      tags,
      connectionId,
      queryText,
      chartConfiguration,
      modifiedBy: email
    });

    const newQuery = await models.queries.save(query);
    return res.json({ query: newQuery });
  } catch (error) {
    sendError(res, error, 'Problem saving query');
  }
});

module.exports = router;
