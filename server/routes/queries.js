const router = require('express').Router();
const queriesUtil = require('../models/queries.js');
const mustBeAuthenticated = require('../middleware/must-be-authenticated.js');
const mustBeAuthenticatedOrChartLink = require('../middleware/must-be-authenticated-or-chart-link-noauth.js');
const sendError = require('../lib/sendError');
const config = require('../lib/config');
const pushQueryToSlack = require('../lib/pushQueryToSlack');

// NOTE: this non-api route is special since it redirects legacy urls
router.get('/queries/:_id', mustBeAuthenticatedOrChartLink, function(
  req,
  res,
  next
) {
  const { query, params } = req;
  const { format } = query;
  if (format === 'table') {
    return res.redirect(config.get('baseUrl') + '/query-table/' + params._id);
  } else if (format === 'chart') {
    return res.redirect(config.get('baseUrl') + '/query-chart/' + params._id);
  }
  next();
});

router.delete('/api/queries/:_id', mustBeAuthenticated, async function(
  req,
  res
) {
  try {
    await queriesUtil.removeById(req.params._id);
    return res.json({});
  } catch (error) {
    sendError(res, error, 'Problem deleting query');
  }
});

router.get('/api/queries', mustBeAuthenticated, async function(req, res) {
  try {
    const queries = await queriesUtil.findAll();
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
    const query = await queriesUtil.findOneById(req.params._id);
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
    const newQuery = await queriesUtil.save(query);
    // This is async, but save operation doesn't care about when/if finished
    pushQueryToSlack(newQuery);
    return res.json({
      query: newQuery
    });
  } catch (error) {
    sendError(res, error, 'Problem saving query');
  }
});

router.put('/api/queries/:_id', mustBeAuthenticated, async function(req, res) {
  try {
    const query = await queriesUtil.findOneById(req.params._id);
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

    const newQuery = await queriesUtil.save(query);
    return res.json({ query: newQuery });
  } catch (error) {
    sendError(res, error, 'Problem saving query');
  }
});

module.exports = router;
