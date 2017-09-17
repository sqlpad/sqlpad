var passport = require('passport')
var router = require('express').Router()
var config = require('../lib/config.js')
const BASE_URL = config.get('baseUrl')

router.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['email'] })
)

router.get(
  '/auth/google/callback',
  passport.authenticate('google', {
    successRedirect: BASE_URL + '/',
    failureRedirect: BASE_URL + '/signin'
  })
)

module.exports = router
