var router = require('express').Router()
var User = require('../models/User.js')
var mustBeAdmin = require('../middleware/must-be-admin.js')

router.get('/users', mustBeAdmin, function (req, res) {
  return res.render('react-applet', {
    pageTitle: 'Users'
  })
})

router.get('/api/users/current', function (req, res) {
  if (req.isAuthenticated() && res.locals.user) {
    res.json({
      user: {
        _id: res.locals.user.id,
        email: res.locals.user.email,
        admin: res.locals.user.admin
      }
    })
  } else {
        // respond with empty object since this isn't really an error
    res.json({})
  }
})

router.get('/api/users', function (req, res) {
  User.findAll(function (err, users) {
    if (err) {
      console.error(err)
      return res.json({
        error: 'Problem querying user database'
      })
    }
    var cleanedUsers = users.map((u) => {
      delete u.password
      delete u.passhash
      return u
    })
    res.json({
      users: cleanedUsers
    })
  })
})

// create/whitelist/invite user
router.post('/api/users', mustBeAdmin, function (req, res) {
  User.findOneByEmail(req.body.email, function (err, user) {
    if (err) {
      console.error(err)
      return res.json({error: 'Problem querying user database'})
    }
    if (user) {
      return res.json({error: 'User already exists'})
    }
    var newUser = new User({
      email: req.body.email,
      admin: req.body.admin === true
    })
    newUser.save(function (err, user) {
      if (err) {
        console.error(err.toString())
        return res.json({
          error: 'Problem saving user to database'
        })
      }
      return res.json({})
    })
  })
})

router.put('/api/users/:_id', mustBeAdmin, function (req, res) {
  if (req.user._id === req.params._id && req.user.admin && req.body.admin === false) return res.json({error: "You can't unadmin yourself"})
  User.findOneById(req.params._id, function (err, user) {
    if (err) {
      console.error(err)
      return res.json({error: 'Problem querying user database'})
    }
    if (!user) return res.json({error: 'user not found'})
        // this route could handle potentially different kinds of updates
        // only update user properties that are explicitly provided in body
    if (req.body.admin != null) user.admin = req.body.admin
    user.save(function (err) {
      if (err) {
        console.error(err)
        return res.json({error: 'Problem saving user to database'})
      }
      return res.json({})
    })
  })
})

router.delete('/api/users/:_id', mustBeAdmin, function (req, res) {
  if (req.user._id === req.params._id) return res.json({error: "You can't delete yourself"})
  User.removeOneById(req.params._id, function (err) {
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
