var router = require('express').Router()
var Connection = require('../models/Connection.js')

// TODO FIXME - This was meant to redirect user to appropriate page depending on state of setup
// I do not think it works anymore and should be revisited (this can be done client-side too)
router.get('/', function(req, res, next) {
  const { config } = req
  const BASE_URL = config.get('baseUrl')

  Connection.findAll(function(err, connections) {
    if (err) {
      console.error(err)
      return next(err)
    }
    if (!req.user) {
      return res.redirect(BASE_URL + '/signin')
    }
    if (connections.length === 0 && req.user.role === 'admin') {
      return res.redirect(BASE_URL + '/connections')
    }
    res.redirect(BASE_URL + '/queries')
  })
})

module.exports = router
