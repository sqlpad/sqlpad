var router = require('express').Router()
var nodemailer = require('nodemailer')
var uuid = require('uuid')
var User = require('../models/User.js')
var config = require('../lib/config.js')

router.post('/api/forgot-password', function (req, res) {
  if (!req.body.email) return res.json({error: 'Email address must be provided'})
  if (!config.smtpConfigured()) return res.json({error: 'Email must be configured'})
  User.findOneByEmail(req.body.email, function (err, user) {
    if (err) {
      console.error(err)
      return res.json({error: 'Problem querying user database'})
    }
    if (!user) {
      // send success regardless. this is not a user-validation service
      return res.json({})
    }
    user.passwordResetId = uuid.v4()
    user.save(function (err) {
      if (err) {
        console.error(err)
        return res.json({error: 'Problem saving to user database'})
      }
      // send email to user
      var smtpConfig = {
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
      var transporter = nodemailer.createTransport(smtpConfig)
      var port = (config.get('port') === 80 ? '' : ':' + config.get('port'))
      var url = config.get('publicUrl') + port + config.get('baseUrl') + '/password-reset/' + user.passwordResetId
      var mailOptions = {
        from: config.get('smtpFrom'),
        to: req.body.email,
        subject: 'SQLPad Password Reset',
        text: 'Hello! \n\nYou recently requested a password reset for your SQLPad account. \n\nTo reset your password, visit ' + url + '.',
        html: '<p>Hello!</p> <p>You recently requested a password reset for your SQLPad account.</p> <p>To reset your password, visit <a href="' + url + '">' + url + '</a>.</p>'
      }
      transporter.sendMail(mailOptions, function (err, info) {
        if (config.get('debug')) console.log('sent email: ' + info)
        if (err) {
          return console.error(err)
        }
      })
      return res.json({})
    })
  })
})

module.exports = router
