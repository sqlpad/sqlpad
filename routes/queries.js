var router = require('express').Router()
var config = require('../lib/config.js')
var Connection = require('../models/Connection.js')
var Query = require('../models/Query.js')
const BASE_URL = config.get('baseUrl')

/*  render page routes
============================================================================= */
router.get('/queries', function (req, res) {
  return res.render('index', {
    pageTitle: 'Queries'
  })
})

router.get('/queries/:_id', function (req, res) {
  var format = req.query.format
  if (format === 'table') return res.redirect(BASE_URL + '/query-table/' + req.params._id)
  else if (format === 'chart') return res.redirect(BASE_URL + '/query-chart/' + req.params._id)
    else {
    return res.render('index', {
      pageTitle: 'Query'
    })
  }
})

router.get('/query-table/:_id', function (req, res) {
  return res.render('index', {
    renderNav: false,
    pageTitle: 'Query Table'
  })
})

router.get('/query-chart/:_id', function (req, res) {
  return res.render('index', {
    renderNav: false,
    pageTitle: 'Query Chart'
  })
})

/*  API routes
============================================================================= */

router.delete('/api/queries/:_id', function (req, res) {
  Query.removeOneById(req.params._id, function (err) {
    if (err) {
      console.error(err)
      return res.json({
        error: 'Problem deleting query'
      })
    }
    res.json({})
  })
})

router.get('/api/queries', function (req, res) {
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
  Query.findAll(function (err, queries) {
    if (err) {
      console.error(err)
      return res.json({
        error: 'Problem querying query database'
      })
    }
    return res.json({
      queries: queries
    })
  })
})

router.get('/api/queries/:_id', function (req, res) {
  Connection.findAll(function (err, connections) {
    if (err) {
      console.error(err)
      return res.json({
        error: 'Problem querying connection database'
      })
    }
    Query.findOneById(req.params._id, function (err, query) {
      if (err) {
        console.error(err)
        return res.json({
          error: 'Problem querying query database',
          connections: connections
        })
      }
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
  })
})

// create new
router.post('/api/queries', function (req, res) {
    // previously posted to api/queries/:_id, req.params._id would have been "new"
    // now though we know its new because the client did that for us
  var query = new Query({
    name: req.body.name || 'No Name Query',
    tags: req.body.tags,
    connectionId: req.body.connectionId,
    queryText: req.body.queryText,
    chartConfiguration: req.body.chartConfiguration,
    createdBy: req.user.email,
    modifiedBy: req.user.email
  })
  query.save(function (err, newQuery) {
    if (err) {
      console.error(err)
      return res.json({
        error: 'Problem saving query'
      })
    }
    // push query to slack if set up.
    // this is async, but save operation doesn't care about when/if finished
    newQuery.pushQueryToSlackIfSetup()
    res.json({
      query: newQuery
    })
  })
})

router.put('/api/queries/:_id', function (req, res) {
  Query.findOneById(req.params._id, function (err, query) {
    if (err) {
      console.error(err)
      return res.send({
        error: 'Problem querying query database'
      })
    }
    if (!query) {
      return res.send({
        error: 'No query found for that Id'
      })
    }
    query.name = req.body.name || ''
    query.tags = req.body.tags
    query.connectionId = req.body.connectionId
    query.queryText = req.body.queryText
    query.chartConfiguration = req.body.chartConfiguration
    query.modifiedBy = req.user.email
    query.save(function (err, newQuery) {
      if (err) {
        console.error(err)
        return res.json({
          error: 'Problem saving query'
        })
      }
      return res.json({
        query: newQuery
      })
    })
  })
})

module.exports = router
