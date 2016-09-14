var router = require('express').Router()
var passport = require('passport')
var getVersion = require('../lib/get-version.js')
var config = require('../lib/config.js')
var User = require('../models/User.js')

// NOTE: this route needs a wildcard because it is fetched as a relative url
// from the front-end. The static SPA does not know if sqlpad is mounted at
// the root of a domain or if there is a base-url provided in the config
router.get('*/api/app', function (req, res) {
  User.adminRegistrationOpen(function (err, open) {
    if (err) {
      console.error(err)
      return res.json({
        error: 'Problem querying users'
      })
    }
    var adminRegistrationOpen = open
    var user
    if (req.isAuthenticated() && res.locals.user) {
      user = {
        _id: res.locals.user.id,
        email: res.locals.user.email,
        admin: res.locals.user.admin
      }
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
