const makeEmail = require('../../lib/email.js');
const { config } = require('../utils');

describe('lib/email.js', async function() {
  if (config.smtpConfigured() && process.env.SQLPAD_TEST_EMAIL) {
    const email = makeEmail(config);

    it('should send invites', function() {
      return email.sendInvite(process.env.SQLPAD_TEST_EMAIL);
    });
    it('should send forgot passwords', function() {
      return email.sendForgotPassword(
        process.env.SQLPAD_TEST_EMAIL,
        '/password-resset/id'
      );
    });
  } else {
    describe('Set env vars to enable:', function() {
      it.skip('SQLPAD_SMTP_HOST');
      it.skip('SQLPAD_SMTP_PORT');
      it.skip('SQLPAD_SMTP_USER');
      it.skip('SQLPAD_SMTP_PASSWORD');
      it.skip('SQLPAD_SMTP_FROM');
      it.skip('PUBLIC_URL');
      it.skip('SQLPAD_TEST_EMAIL');
      it.skip('SQLPAD_SMTP_SECURE (opt. probably to false)');
    });
  }
});
