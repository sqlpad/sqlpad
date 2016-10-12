/*  Homepage

    The main homepage/root of the thing.
    For now it just redirects the user to a more appropriate page.
    If there are connections in the system, it redirects to the queries listing.
    If there are no connections, the user goes to the connections page
============================================================================= */
var router = require('express').Router()
var Connection = require('../models/Connection.js')
var config = require('../lib/config.js')
const BASE_URL = config.get('baseUrl')

router.get('/', function (req, res, next) {
  Connection.findAll(function (err, connections) {
    if (err) {
      console.error(err)
      return next(err)
    }
    if (!res.locals.user) {
      return res.redirect(BASE_URL + '/signin')
    }
    if (connections.length === 0 && res.locals.user.role === 'admin') {
      return res.redirect(BASE_URL + '/connections')
    }
    res.redirect(BASE_URL + '/queries')
  })
})

module.exports = router
