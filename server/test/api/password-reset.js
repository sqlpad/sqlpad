const assert = require('assert');
const utils = require('../utils');
const uuid = require('uuid');
const User = require('../../models/User');

async function setReset() {
  const user = await User.findOneByEmail('admin@test.com');
  const passwordResetId = uuid.v4();
  user.passwordResetId = passwordResetId;
  await user.save();
  return passwordResetId;
}

describe('api/password-reset', function() {
  before(function() {
    return utils.resetWithUser();
  });

  it('Allows resetting password', async function() {
    const passwordResetId = await setReset();
    const body = await utils.post(
      'admin',
      `/api/password-reset/${passwordResetId}`,
      {
        email: 'admin@test.com',
        password: 'admin',
        passwordConfirmation: 'admin'
      }
    );
    assert(!body.error, 'Expect no error');
  });

  it('Errors for wrong passwordResetId', async function() {
    await setReset();
    const body = await utils.post('admin', `/api/password-reset/123`, {
      email: 'admin@test.com',
      password: 'admin',
      passwordConfirmation: 'admin'
    });
    assert(body.error, 'Expect error');
  });

  it('Errors for wrong email', async function() {
    const passwordResetId = await setReset();
    const body = await utils.post(
      'admin',
      `/api/password-reset/${passwordResetId}`,
      {
        email: 'wrongemail@test.com',
        password: 'admin',
        passwordConfirmation: 'admin'
      }
    );
    assert(body.error, 'Expect error');
  });

  it('Errors for mismatched passwords', async function() {
    const passwordResetId = await setReset();
    const body = await utils.post(
      'admin',
      `/api/password-reset/${passwordResetId}`,
      {
        email: 'admin@test.com',
        password: 'admin2',
        passwordConfirmation: 'admin'
      }
    );
    assert(body.error, 'Expect error');
  });
});
