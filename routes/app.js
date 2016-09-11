var router = require('express').Router()
var passport = require('passport')
var getVersion = require('../lib/get-version.js')
var config = require('../lib/config.js')
var User = require('../models/User.js')

router.get('/api/app', function (req, res) {
  User.adminRegistrationOpen(function (err, open) {
    if (err) {
      console.error(err)
      return res.json({
        error: 'Problem querying users'
      })
    }
    var adminRegistrationOpen = open
    var user = {}
    if (req.isAuthenticated() && res.locals.user) {
      user._id = res.locals.user.id
      user.email = res.locals.user.email
      user.admin = res.locals.user.admin
    }
    res.json({
      adminRegistrationOpen: adminRegistrationOpen,
      currentUser: user,
      config: config.getAllValues(),
      version: getVersion(),
      passport: {
        strategies: passport._strategies
      }
    })
  })
})

module.exports = router
