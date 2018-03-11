const router = require('express').Router()
const User = require('../models/User.js')
const sendError = require('../lib/sendError')

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
        return res.json({ error: 'Password reset permissions not found' })
      }
      if (req.body.email !== user.email) {
        return res.json({ error: 'Incorrect email address' })
      }
      if (req.body.password !== req.body.passwordConfirmation) {
        return res.json({ error: 'Passwords do not match' })
      }
      user.password = req.body.password
      user.passwordResetId = ''
      return user.save().then(() => res.json({}))
    })
    .catch(error => sendError(res, error, 'Problem querying user database'))
})

module.exports = router
