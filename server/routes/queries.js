const router = require('express').Router()
const Connection = require('../models/Connection.js')
const Query = require('../models/Query.js')
const mustBeAuthenticated = require('../middleware/must-be-authenticated.js')
const mustBeAuthenticatedOrChartLink = require('../middleware/must-be-authenticated-or-chart-link-noauth.js')
const sendError = require('../lib/sendError')

/*  render page routes
============================================================================= */

// NOTE: this non-api route is special since it redirects legacy urls
router.get('/queries/:_id', mustBeAuthenticatedOrChartLink, function(
  req,
  res,
  next
) {
  const { config } = req
  var format = req.query.format
  if (format === 'table') {
    return res.redirect(
      config.get('baseUrl') + '/query-table/' + req.params._id
    )
  } else if (format === 'chart') {
    return res.redirect(
      config.get('baseUrl') + '/query-chart/' + req.params._id
    )
  }
  next()
})

/*  API routes
============================================================================= */

router.delete('/api/queries/:_id', mustBeAuthenticated, function(req, res) {
  return Query.removeOneById(req.params._id)
    .then(() => res.json({}))
    .catch(error => sendError(res, error, 'Problem deleting query'))
})

router.get('/api/queries', mustBeAuthenticated, function(req, res) {
  /*
  NOTE: db side filter. implement or?
  var filter = {};
  if (req.query && req.query.tag) {
      filter.tags = req.query.tag;
  }
  if (req.query && req.query.connection) {
      filter.connectionId = req.query.connection;
  }
  if (req.query && req.query.createdBy) {
      filter.createdBy =
  }
  if (req.query && req.query.search) {
      var nameRegExp = new RegExp(req.query.search, "i");
      var queryTextRegExp = new RegExp(req.query.search, "i");
      filter.$or = [{queryText: {$regex: queryTextRegExp}}, {name: {$regex: nameRegExp}}];
  }
  Query.findByFilter(filter, function (err, queries) {

  });
  */
  return Query.findAll()
    .then(queries => res.json({ queries }))
    .catch(error => sendError(res, error, 'Problem querying query database'))
})

router.get('/api/queries/:_id', mustBeAuthenticatedOrChartLink, function(
  req,
  res
) {
  // TODO only return queries
  return Promise.all([Connection.findAll(), Query.findOneById(req.params._id)])
    .then(data => {
      const [connections, query] = data
      if (!query) {
        return res.json({
          connections: connections,
          query: {}
        })
      }
      return res.json({
        connections: connections,
        query: query
      })
    })
    .catch(error => sendError('Problem getting query'))
})

// create new
router.post('/api/queries', mustBeAuthenticated, function(req, res) {
  const query = new Query({
    name: req.body.name || 'No Name Query',
    tags: req.body.tags,
    connectionId: req.body.connectionId,
    queryText: req.body.queryText,
    chartConfiguration: req.body.chartConfiguration,
    createdBy: req.user.email,
    modifiedBy: req.user.email
  })
  return query
    .save()
    .then(newQuery => {
      // This is async, but save operation doesn't care about when/if finished
      newQuery.pushQueryToSlackIfSetup()
      return res.json({
        query: newQuery
      })
    })
    .catch(error => sendError(res, error, 'Problem saving query'))
})

router.put('/api/queries/:_id', mustBeAuthenticated, function(req, res) {
  return Query.findOneById(req.params._id)
    .then(query => {
      if (!query) {
        return sendError(res, null, 'Query not found')
      }

      query.name = req.body.name || ''
      query.tags = req.body.tags
      query.connectionId = req.body.connectionId
      query.queryText = req.body.queryText
      query.chartConfiguration = req.body.chartConfiguration
      query.modifiedBy = req.user.email

      return query.save().then(newQuery => res.json({ query: newQuery }))
    })
    .catch(error => sendError(res, error, 'Problem saving query'))
})

module.exports = router
