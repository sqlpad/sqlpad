const assert = require('assert');
const TestUtil = require('../utils');

describe('api/signup & api/signin', function() {
  const utils = new TestUtil();

  before(function() {
    return utils.init();
  });

  it('allows new user signup', async function() {
    const body = await utils.post(null, '/api/signup', {
      password: 'admin',
      passwordConfirmation: 'admin',
      email: 'admin@test.com'
    });
    assert(!body.error, 'Expect no error');
  });

  it('allows new user sign in', async function() {
    const body = await utils.post(null, '/api/signin', {
      password: 'admin',
      email: 'admin@test.com'
    });
    assert(!body.error, 'Expect no error');
  });

  it('unauthorized for bad signin', async function() {
    await utils.post(
      null,
      '/api/signin',
      {
        password: 'wrong-password',
        email: 'admin@test.com'
      },
      401
    );
  });

  it('prevents duplicate signups', async function() {
    const body = await utils.post(null, '/api/signup', {
      password: 'admin',
      passwordConfirmation: 'admin',
      email: 'admin@test.com'
    });
    assert(body.error, 'Expect error user already signed up');
  });

  it('prevents open signups', async function() {
    const body = await utils.post(null, '/api/signup', {
      password: 'notwhitelisted',
      passwordConfirmation: 'notwhitelisted',
      email: 'notwhitelisted@test.com'
    });
    assert(body.error, 'Expect error needing whitelist');
  });

  it('supports case insensitive login', async function() {
    const body = await utils.post('admin', '/api/users', {
      email: 'userCase@test.com',
      role: 'editor'
    });
    assert(!body.error, 'no error');

    const body2 = await utils.post(null, '/api/signup', {
      password: 'password',
      passwordConfirmation: 'password',
      email: 'Usercase@test.com'
    });
    assert(!body2.error, 'Expect no error');
  });

  it('allows emails containing +', async function() {
    const body = await utils.post('admin', '/api/users', {
      email: 'user+foobar@test.com',
      role: 'editor'
    });
    assert(!body.error, 'no error');

    const body2 = await utils.post(null, '/api/signup', {
      password: 'password',
      passwordConfirmation: 'password',
      email: 'user+foobar@test.com'
    });
    assert(!body2.error, 'Expect no error');
  });
});

describe('local auth disabled', async function() {
  const utils = new TestUtil({
    disableUserpassAuth: 'true'
  });

  before(function() {
    return utils.init();
  });

  it('api/signup is not available', async function() {
    await utils.post(
      null,
      '/api/signup',
      {
        password: 'admin',
        passwordConfirmation: 'admin',
        email: 'admin@test.com'
      },
      404
    );
  });
});
