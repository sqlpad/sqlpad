const router = require('express').Router()
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
  const { config, query, params } = req
  const { format } = query
  if (format === 'table') {
    return res.redirect(config.get('baseUrl') + '/query-table/' + params._id)
  } else if (format === 'chart') {
    return res.redirect(config.get('baseUrl') + '/query-chart/' + params._id)
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
  return Query.findAll()
    .then(queries => res.json({ queries }))
    .catch(error => sendError(res, error, 'Problem querying query database'))
})

router.get('/api/queries/:_id', mustBeAuthenticatedOrChartLink, function(
  req,
  res
) {
  return Query.findOneById(req.params._id)
    .then(query => {
      if (!query) {
        return res.json({
          query: {}
        })
      }
      return res.json({ query })
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
