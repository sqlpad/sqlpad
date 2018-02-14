const router = require('express').Router()
const User = require('../models/User.js')
const email = require('../lib/email')
const mustBeAdmin = require('../middleware/must-be-admin.js')
const mustBeAuthenticated = require('../middleware/must-be-authenticated.js')

router.get('/api/users/current', function(req, res) {
  if (req.isAuthenticated() && req.user) {
    res.json({
      user: {
        _id: req.user.id,
        email: req.user.email,
        role: req.user.role
      }
    })
  } else {
    // respond with empty object since this isn't really an error
    res.json({})
  }
})

router.get('/api/users', mustBeAuthenticated, function(req, res) {
  User.findAll(function(err, users) {
    if (err) {
      console.error(err)
      return res.json({
        error: 'Problem querying user database'
      })
    }
    res.json({
      users: users
    })
  })
})

// create/whitelist/invite user
router.post('/api/users', mustBeAdmin, function(req, res) {
  const { config } = req
  User.findOneByEmail(req.body.email, function(err, user) {
    if (err) {
      console.error(err)
      return res.json({ error: 'Problem querying user database' })
    }
    if (user) {
      return res.json({ error: 'User already exists' })
    }
    const newUser = new User({
      email: req.body.email,
      role: req.body.role
    })
    newUser.save(function(err, user) {
      if (err) {
        console.error(err.toString())
        return res.json({
          error: 'Problem saving user to database'
        })
      }

      if (config.smtpConfigured()) {
        email.sendInvite(req.body.email).catch(error => console.error(error))
      }
      return res.json({})
    })
  })
})

router.put('/api/users/:_id', mustBeAdmin, function(req, res) {
  if (
    req.user._id === req.params._id &&
    req.user.role === 'admin' &&
    req.body.role != null
  ) {
    return res.json({ error: "You can't unadmin yourself" })
  }
  User.findOneById(req.params._id, function(err, user) {
    if (err) {
      console.error(err)
      return res.json({ error: 'Problem querying user database' })
    }
    if (!user) return res.json({ error: 'user not found' })
    // this route could handle potentially different kinds of updates
    // only update user properties that are explicitly provided in body
    if (req.body.role != null) user.role = req.body.role
    if (req.body.passwordResetId != null) {
      user.passwordResetId = req.body.passwordResetId
    }
    user.save(function(err) {
      if (err) {
        console.error(err)
        return res.json({ error: 'Problem saving user to database' })
      }
      return res.json({})
    })
  })
})

router.delete('/api/users/:_id', mustBeAdmin, function(req, res) {
  if (req.user._id === req.params._id) {
    return res.json({ error: "You can't delete yourself" })
  }
  User.removeOneById(req.params._id, function(err) {
    if (err) {
      console.error(err)
      return res.json({
        error: 'Problem deleting user in database'
      })
    }
    return res.json({})
  })
})

module.exports = router
