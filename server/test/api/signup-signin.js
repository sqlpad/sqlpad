const assert = require('assert');
const TestUtil = require('../utils');

describe('api/signup', function() {
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
});

describe('api/signin', function() {
  const utils = new TestUtil();

  before(function() {
    return utils.init(true);
  });

  it('signs in user', async function() {
    const body = await utils.post(null, '/api/signin', {
      password: 'admin',
      email: 'admin@test.com'
    });
    assert(!body.error, 'Expect no error');
  });
});
