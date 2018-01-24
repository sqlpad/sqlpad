const router = require('express').Router()
const nodemailer = require('nodemailer')
const User = require('../models/User.js')
const config = require('../lib/config.js')
const mustBeAdmin = require('../middleware/must-be-admin.js')
const mustBeAuthenticated = require('../middleware/must-be-authenticated.js')

router.get('/api/users/current', function(req, res) {
  if (req.isAuthenticated() && res.locals.user) {
    res.json({
      user: {
        _id: res.locals.user.id,
        email: res.locals.user.email,
        role: res.locals.user.role
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
      // send email if SMTP is set up
      if (config.smtpConfigured()) {
        if (config.get('debug')) console.log('sending email')
        const smtpConfig = {
          host: config.get('smtpHost'),
          port: config.get('smtpPort'),
          secure: config.get('smtpSecure'),
          auth: {
            user: config.get('smtpUser'),
            pass: config.get('smtpPassword')
          },
          tls: {
            ciphers: 'SSLv3'
          }
        }
        const transporter = nodemailer.createTransport(smtpConfig)
        const signupPort =
          config.get('port') === 80 ? '' : ':' + config.get('port')
        const signupUrl =
          config.get('publicUrl') +
          signupPort +
          config.get('baseUrl') +
          '/signup'
        const mailOptions = {
          from: config.get('smtpFrom'),
          to: req.body.email,
          subject: "You've been invited to SQLPad",
          text:
            'Hello! \n\nA colleague has invited you to SQLPad. \n\nTo sign up, visit ' +
            signupUrl +
            '.',
          html:
            '<p>Hello!</p> <p>A colleague has invited you to SQLPad.</p> <p>To sign up, visit <a href="' +
            signupUrl +
            '">' +
            signupUrl +
            '</a>.</p>'
        }
        transporter.sendMail(mailOptions, function(err, info) {
          if (config.get('debug')) console.log('sent email: ' + info)
          if (err) {
            return console.error(err)
          }
        })
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
