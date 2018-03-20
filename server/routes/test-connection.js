const router = require('express').Router()
const runQuery = require('../lib/run-query.js')
const mustBeAdmin = require('../middleware/must-be-admin.js')
const sendError = require('../lib/sendError')

router.post('/api/test-connection', mustBeAdmin, function(req, res) {
  const { body } = req
  let testQuery = "SELECT 'success' AS TestQuery;"
  // TODO move this to drivers implementation
  if (body.driver === 'crate') {
    testQuery = 'SELECT name from sys.cluster'
  }
  if (body.driver === 'presto') {
    testQuery = "SELECT 'success' AS TestQuery"
  }
  if (body.driver === 'hdb') {
    testQuery = 'select * from DUMMY'
  }
  runQuery(testQuery, body, function(err, queryResult) {
    if (err) {
      return sendError(res, err)
    }
    return res.send({
      results: queryResult.rows
    })
  })
})

module.exports = router
