const router = require('express').Router()
const User = require('../models/User.js')
const email = require('../lib/email')
const mustBeAdmin = require('../middleware/must-be-admin.js')
const mustBeAuthenticated = require('../middleware/must-be-authenticated.js')
const sendError = require('../lib/sendError')

router.get('/api/users', mustBeAuthenticated, function(req, res) {
  return User.findAll()
    .then(users => res.json({ users }))
    .catch(error => sendError(res, error, 'Problem getting uers'))
})

// create/whitelist/invite user
router.post('/api/users', mustBeAdmin, function(req, res) {
  const { config } = req
  return User.findOneByEmail(req.body.email)
    .then(user => {
      if (user) {
        return sendError(res, null, 'User already exists')
      }
      const newUser = new User({
        email: req.body.email.toLowerCase(),
        role: req.body.role
      })
      return newUser.save().then(user => {
        if (config.smtpConfigured()) {
          email.sendInvite(req.body.email).catch(error => console.error(error))
        }
        return res.json({ user })
      })
    })
    .catch(error => sendError(res, error, 'Problem saving user'))
})

router.put('/api/users/:_id', mustBeAdmin, function(req, res) {
  const { params, body, user } = req
  if (user._id === params._id && user.role === 'admin' && body.role != null) {
    return sendError(res, null, "You can't unadmin yourself")
  }
  return User.findOneById(params._id)
    .then(user => {
      if (!user) {
        return sendError(res, null, 'user not found')
      }
      // this route could handle potentially different kinds of updates
      // only update user properties that are explicitly provided in body
      if (body.role != null) {
        user.role = body.role
      }
      if (body.passwordResetId != null) {
        user.passwordResetId = body.passwordResetId
      }
      return user.save().then(() => res.json({ user }))
    })
    .catch(error => sendError(res, error, 'Problem saving user'))
})

router.delete('/api/users/:_id', mustBeAdmin, function(req, res) {
  if (req.user._id === req.params._id) {
    return sendError(res, null, "You can't delete yourself")
  }
  return User.removeOneById(req.params._id)
    .then(() => res.json({}))
    .catch(error => sendError(res, error, 'Problem deleting user'))
})

module.exports = router
