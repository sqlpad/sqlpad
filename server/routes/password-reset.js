const router = require('express').Router()
const User = require('../models/User.js')
const sendError = require('../lib/sendError')

// This route is just to verify that the passwordReset is valid
// TODO This could be removed and validated on POST
router.get('/api/password-reset/:passwordResetId', function(req, res) {
  return User.findOneByPasswordResetId(req.params.passwordResetId)
    .then(user => {
      if (!user) {
        return res.json({})
      }
      return res.json({ passwordResetId: req.params.passwordResetId })
    })
    .catch(error => sendError(res, error, 'Problem querying user database'))
})

router.post('/api/password-reset/:passwordResetId', function(req, res) {
  return User.findOneByPasswordResetId(req.params.passwordResetId)
    .then(user => {
      if (!user) {
        return sendError(res, null, 'Password reset permissions not found')
      }
      if (req.body.email !== user.email) {
        return sendError(res, null, 'Incorrect email address')
      }
      if (req.body.password !== req.body.passwordConfirmation) {
        return sendError(res, null, 'Passwords do not match')
      }
      user.password = req.body.password
      user.passwordResetId = ''
      return user.save().then(() => res.json({}))
    })
    .catch(error => sendError(res, error, 'Problem querying user database'))
})

module.exports = router
