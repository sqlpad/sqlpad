import assert from 'assert';
import { v4 as uuidv4 } from 'uuid';
import TestUtils from '../utils.js';

describe('api/password-reset', function () {
  const utils = new TestUtils();

  async function setReset() {
    const user = await utils.models.users.findOneByEmail('admin@test.com');
    const update = {
      passwordResetId: uuidv4(),
    };
    await utils.models.users.update(user.id, update);
    return update.passwordResetId;
  }

  before(function () {
    return utils.init(true);
  });

  it('Allows resetting password', async function () {
    const passwordResetId = await setReset();
    await utils.post('admin', `/api/password-reset/${passwordResetId}`, {
      email: 'admin@test.com',
      password: 'admin',
      passwordConfirmation: 'admin',
    });
  });

  it('Errors for wrong passwordResetId', async function () {
    await setReset();
    await utils.post(
      'admin',
      `/api/password-reset/${uuidv4()}`,
      {
        email: 'admin@test.com',
        password: 'admin',
        passwordConfirmation: 'admin',
      },
      400
    );
  });

  it('Errors for wrong email', async function () {
    const passwordResetId = await setReset();
    const body = await utils.post(
      'admin',
      `/api/password-reset/${passwordResetId}`,
      {
        email: 'wrongemail@test.com',
        password: 'admin',
        passwordConfirmation: 'admin',
      },
      400
    );
    assert.equal(body.title, 'Incorrect email address');
  });

  it('Errors for mismatched passwords', async function () {
    const passwordResetId = await setReset();
    const body = await utils.post(
      'admin',
      `/api/password-reset/${passwordResetId}`,
      {
        email: 'admin@test.com',
        password: 'admin2',
        passwordConfirmation: 'admin',
      },
      400
    );
    assert.equal(body.title, 'Passwords do not match');
  });
});
