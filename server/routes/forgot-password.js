const router = require('express').Router()
const uuid = require('uuid')
const User = require('../models/User.js')
const email = require('../lib/email')

router.post('/api/forgot-password', function(req, res) {
  const { config } = req

  if (!req.body.email) {
    return res.json({ error: 'Email address must be provided' })
  }
  if (!config.smtpConfigured()) {
    return res.json({ error: 'Email must be configured' })
  }
  User.findOneByEmail(req.body.email, function(err, user) {
    if (err) {
      console.error(err)
      return res.json({ error: 'Problem querying user database' })
    }
    // If user not found send success regardless
    // This is not a user-validation service
    if (!user) {
      return res.json({})
    }

    user.passwordResetId = uuid.v4()
    user.save(function(err) {
      if (err) {
        console.error(err)
        return res.json({ error: 'Problem saving to user database' })
      }

      const resetPath = `/password-reset/${user.passwordResetId}`

      // Send email, but do not block response to client
      email
        .sendForgotPassword(req.body.email, resetPath)
        .catch(error => console.error(error))

      return res.json({})
    })
  })
})

module.exports = router
