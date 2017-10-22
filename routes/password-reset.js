var router = require('express').Router()
var User = require('../models/User.js')

router.get('/api/password-reset/:passwordResetId', function(req, res) {
  User.findOneByPasswordResetId(req.params.passwordResetId, function(
    err,
    user
  ) {
    if (err) {
      console.error(err)
      return res.json({ error: 'Problem querying user database' })
    }
    if (!user) {
      return res.json({})
    }
    return res.json({ passwordResetId: req.params.passwordResetId })
  })
})

router.post('/api/password-reset/:passwordResetId', function(req, res) {
  User.findOneByPasswordResetId(req.params.passwordResetId, function(
    err,
    user
  ) {
    if (err) {
      console.error(err)
      return res.json({ error: 'Problem querying user database' })
    }
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
    user.save(function(err) {
      if (err) {
        console.error(err)
        return res.json({ error: 'Error saving update to DB' })
      }
      return res.json({})
    })
  })
})

module.exports = router
