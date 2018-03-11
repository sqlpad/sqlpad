const router = require('express').Router()
const uuid = require('uuid')
const User = require('../models/User.js')
const email = require('../lib/email')
const sendError = require('../lib/sendError')

router.post('/api/forgot-password', function(req, res) {
  const { config } = req

  if (!req.body.email) {
    return sendError(res, null, 'Email address must be provided')
  }
  if (!config.smtpConfigured()) {
    return sendError(res, null, 'Email must be configured')
  }

  return User.findOneByEmail(req.body.email)
    .then(user => {
      // If user not found send success regardless
      // This is not a user-validation service
      if (!user) {
        return res.json({})
      }

      user.passwordResetId = uuid.v4()

      return user.save().then(() => {
        const resetPath = `/password-reset/${user.passwordResetId}`
        // Send email, but do not block response to client
        email
          .sendForgotPassword(req.body.email, resetPath)
          .catch(error => console.error(error))

        return res.json({})
      })
    })
    .catch(error => sendError(res, error, 'Problem saving user'))
})

module.exports = router
