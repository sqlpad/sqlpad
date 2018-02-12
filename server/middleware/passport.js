var async = require('async')
var passport = require('passport')
var PassportLocalStrategy = require('passport-local').Strategy
var PassportGoogleStrategy = require('passport-google-oauth2').Strategy
var BasicStrategy = require('passport-http').BasicStrategy
var User = require('../models/User.js')
const configUtil = require('../lib/config')
const db = require('../lib/db')
var checkWhitelist = require('../lib/check-whitelist.js')
const {
  baseUrl,
  googleClientId,
  googleClientSecret,
  publicUrl,
  disableUserpassAuth
} = require('../lib/config').getPreDbConfig()

passport.serializeUser(function(user, done) {
  done(null, user.id)
})

passport.deserializeUser(function(id, done) {
  User.findOneById(id, function(err, user) {
    if (err) return done(err)
    if (user) {
      done(null, {
        id: user._id,
        _id: user._id,
        role: user.role,
        email: user.email
      })
    } else {
      done(null, false)
    }
  })
})

if (!disableUserpassAuth) {
  passport.use(
    new PassportLocalStrategy(
      {
        usernameField: 'email'
      },
      function passportLocalStrategyHandler(email, password, done) {
        User.findOneByEmail(email, function(err, user) {
          if (err) return done(err)
          if (!user) {
            return done(null, false, { message: 'wrong email or password' })
          }
          user.comparePasswordToHash(password, function(err, isMatch) {
            if (err) return done(err)
            if (isMatch) {
              return done(null, {
                id: user._id,
                _id: user._id,
                role: user.role,
                email: user.email
              })
            }
            return done(null, false, { message: 'wrong email or password' })
          })
        })
      }
    )
  )

  passport.use(
    new BasicStrategy(function(username, password, callback) {
      User.findOneByEmail(username, function(err, user) {
        if (err) return callback(err)
        if (!user) return callback(null, false)
        user.comparePasswordToHash(password, function(err, isMatch) {
          if (err) return callback(err)
          if (!isMatch) return callback(null, false)
          return callback(null, user)
        })
      })
    })
  )
}

if (googleClientId && googleClientSecret && publicUrl) {
  passport.use(
    new PassportGoogleStrategy(
      {
        clientID: googleClientId,
        clientSecret: googleClientSecret,
        callbackURL: publicUrl + baseUrl + '/auth/google/callback',
        passReqToCallback: true
      },
      passportGoogleStrategyHandler
    )
  )
}

function passportGoogleStrategyHandler(
  request,
  accessToken,
  refreshToken,
  profile,
  done
) {
  async.waterfall(
    [
      function getOpenAdminRegistration(next) {
        var data = {}
        User.adminRegistrationOpen(function(err, openReg) {
          data.openAdminRegistration = openReg
          next(err, data)
        })
      },
      function getUserForProfileEmail(data, next) {
        User.findOneByEmail(profile.email, function(err, user) {
          data.user = user
          next(err, data)
        })
      },
      function getConfigHelper(data, next) {
        configUtil
          .getHelper(db)
          .then(config => {
            data.config = config
            next(null, data)
          })
          .catch(error => next(error))
      },
      function createUserIfNeeded(data, next) {
        if (data.user) {
          return next(null, data)
        }
        const whitelistedDomains = data.config.get('whitelistedDomains')
        if (
          data.openAdminRegistration ||
          checkWhitelist(whitelistedDomains, profile.email)
        ) {
          data.user = new User({
            email: profile.email,
            role: data.openAdminRegistration ? 'admin' : 'editor'
          })
          return next(null, data)
        }
        // at this point we don't have an error, but authentication is invalid
        // per passport docs, we call done() here without an error
        // instead passing false for user and a message why
        return done(null, false, {
          message: "You haven't been invited by an admin yet."
        })
      },
      function saveUser(data, next) {
        data.user.signupDate = new Date()
        data.user.save(function(err, newUser) {
          data.user = newUser
          return next(err, data)
        })
      }
    ],
    function(err, data) {
      if (err) return done(err, null)
      return done(null, {
        id: data.user._id,
        _id: data.user._id,
        email: data.user.email,
        role: data.user.role
      })
    }
  )
}
