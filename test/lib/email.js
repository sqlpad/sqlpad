const email = require('../../lib/email.js')
const config = require('../../lib/config.js')

describe('lib/email.js', function() {
  if (config.smtpConfigured() && process.env.SQLPAD_TEST_EMAIL) {
    describe('#send()', function() {
      it('should send without error', function() {
        // TODO test other kinds of emails
        return email.send(
          process.env.SQLPAD_TEST_EMAIL,
          'test',
          'test',
          '<h1>test</h1>'
        )
      })
    })
  } else {
    describe('#send() - set env vars to enable:', function() {
      it.skip('SQLPAD_SMTP_HOST')
      it.skip('SQLPAD_SMTP_USER')
      it.skip('SQLPAD_SMTP_FROM')
      it.skip('SQLPAD_SMTP_PORT')
      it.skip('PUBLIC_URL')
      it.skip('SQLPAD_TEST_EMAIL')
    })
  }
})
