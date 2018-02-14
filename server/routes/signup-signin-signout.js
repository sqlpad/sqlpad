var passport = require('passport')
var router = require('express').Router()
var checkWhitelist = require('../lib/check-whitelist')
var User = require('../models/User.js')

// NOTE: getting config here during module init is okay
// since these configs are set via env or cli
const { disableUserpassAuth } = require('../lib/config').getPreDbConfig()

function adminRegistrationOpen(req, res, next) {
  User.adminRegistrationOpen(function(err, open) {
    res.locals.adminRegistrationOpen = open
    next(err)
  })
}

/*  Some routes should only exist if userpath auth is enabled
============================================================================= */
if (!disableUserpassAuth) {
  router.post('/api/signup', adminRegistrationOpen, function(req, res) {
    if (req.body.password !== req.body.passwordConfirmation) {
      return res.json({ error: 'Passwords do not match' })
    }
    User.findOneByEmail(req.body.email, function(err, user) {
      if (err) {
        console.error(err)
        return res.json({ error: 'Error looking up user by email' })
      }
      if (user && user.passhash) {
        return res.json({ error: 'User already signed up' })
      }
      if (user) {
        user.password = req.body.password
        user.signupDate = new Date()
      }
      if (!user) {
        // if open admin registration or whitelisted email create user
        // otherwise exit
        const whitelistedDomains = req.config.get('whitelistedDomains')
        if (
          res.locals.adminRegistrationOpen ||
          checkWhitelist(whitelistedDomains, req.body.email)
        ) {
          user = new User({
            email: req.body.email,
            password: req.body.password,
            role: res.locals.adminRegistrationOpen ? 'admin' : 'editor',
            signupDate: new Date()
          })
        } else {
          return res.json({ error: 'Email address not yet whitelisted' })
        }
      }
      user.save(function(err, newUser) {
        if (err) {
          console.error(err)
          return res.json({ error: 'Error saving new user to DB' })
        }
        return res.json({})
      })
    })
  })

  router.post('/api/signin', passport.authenticate('local'), function(
    req,
    res
  ) {
    // if it makes it here, the authentication succeded
    res.json({})
  })
}

/*  These auth routes should always exist regardless of strategy
============================================================================= */
router.get('/api/signout', function(req, res) {
  req.session = null
  res.json({})
})

module.exports = router
