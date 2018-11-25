const passport = require('passport')
const router = require('express').Router()
const checkWhitelist = require('../lib/check-whitelist')
const User = require('../models/User.js')
const sendError = require('../lib/sendError')

// NOTE: getting config here during module init is okay
// since these configs are set via env or cli
const { disableUserpassAuth } = require('../lib/config').getPreDbConfig()

/*  Some routes should only exist if userpath auth is enabled
============================================================================= */
if (!disableUserpassAuth) {
  router.post('/api/signup', function(req, res) {
    const whitelistedDomains = req.config.get('whitelistedDomains')

    if (req.body.password !== req.body.passwordConfirmation) {
      return sendError(res, null, 'Passwords do not match')
    }
    return Promise.all([
      User.findOneByEmail(req.body.email),
      User.adminRegistrationOpen()
    ])
      .then(data => {
        let [user, adminRegistrationOpen] = data
        if (user && user.passhash) {
          return sendError(res, null, 'User already signed up')
        }
        if (user) {
          user.password = req.body.password
          user.signupDate = new Date()
        }
        if (!user) {
          // if open admin registration or whitelisted email create user
          // otherwise exit
          if (
            adminRegistrationOpen ||
            checkWhitelist(whitelistedDomains, req.body.email)
          ) {
            user = new User({
              email: req.body.email,
              password: req.body.password,
              role: adminRegistrationOpen ? 'admin' : 'editor',
              signupDate: new Date()
            })
          } else {
            return sendError(res, null, 'Email address not whitelisted')
          }
        }
        return user.save().then(newUser => res.json({}))
      })
      .catch(error => sendError(res, error, 'Error saving user'))
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
  if (!req.session) {
    return res.json({})
  }
  req.session.destroy(function(err) {
    if (err) {
      console.error(err)
    }
    res.json({})
  })
})

module.exports = router
