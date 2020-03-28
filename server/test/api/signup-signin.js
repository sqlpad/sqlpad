const assert = require('assert');
const request = require('supertest');
const TestUtil = require('../utils');

describe('api/signup & api/signin', function() {
  const utils = new TestUtil({
    authProxyEnabled: false
  });

  before(function() {
    return utils.init();
  });

  it('allows new user signup', async function() {
    const { body } = await request(utils.app)
      .post('/api/signup')
      .send({
        password: 'admin',
        passwordConfirmation: 'admin',
        email: 'admin@test.com'
      })
      .expect(200);

    assert(!body.error, 'Expect no error');
  });

  it('allows new user sign in', async function() {
    const { body } = await request(utils.app)
      .post('/api/signin')
      .send({
        password: 'admin',
        email: 'admin@test.com'
      })
      .expect(200);

    assert(!body.error, 'Expect no error');
  });

  it('unauthorized for bad signin', async function() {
    await request(utils.app)
      .post('/api/signin')
      .send({
        password: 'wrong-password',
        email: 'admin@test.com'
      })
      .expect(401);
  });

  it('prevents duplicate signups', async function() {
    const { body } = await request(utils.app)
      .post('/api/signup')
      .send({
        password: 'admin',
        passwordConfirmation: 'admin',
        email: 'admin@test.com'
      })
      .expect(200);

    assert(body.error, 'Expect error user already signed up');
  });

  it('prevents open signups', async function() {
    const { body } = await request(utils.app)
      .post('/api/signup')
      .send({
        password: 'notwhitelisted',
        passwordConfirmation: 'notwhitelisted',
        email: 'notwhitelisted@test.com'
      })
      .expect(200);
    assert(body.error, 'Expect error needing whitelist');
  });

  it('supports case insensitive login', async function() {
    // Add user via API
    const response1 = await request(utils.app)
      .post('/api/users')
      .auth('admin@test.com', 'admin')
      .send({
        email: 'userCase@test.com',
        role: 'editor'
      })
      .expect(200);
    assert(!response1.body.error, 'no error');

    const response2 = await request(utils.app)
      .post('/api/signup')
      .send({
        password: 'password',
        passwordConfirmation: 'password',
        email: 'Usercase@test.com'
      })
      .expect(200);
    assert(!response2.error, 'Expect no error');
  });

  it('allows emails containing +', async function() {
    // Add user via API
    const response1 = await request(utils.app)
      .post('/api/users')
      .auth('admin@test.com', 'admin')
      .send({
        email: 'user+foobar@test.com',
        role: 'editor'
      })
      .expect(200);
    assert(!response1.body.error, 'no error');

    const response2 = await request(utils.app)
      .post('/api/signup')
      .send({
        password: 'password',
        passwordConfirmation: 'password',
        email: 'user+foobar@test.com'
      })
      .expect(200);
    assert(!response2.error, 'Expect no error');
  });
});

describe('local auth disabled', async function() {
  const utils = new TestUtil({
    disableUserpassAuth: 'true',
    authProxyEnabled: false
  });

  before(function() {
    return utils.init();
  });

  it('api/signup is not available', async function() {
    await request(utils.app)
      .post('/api/signup')
      .send({
        password: 'admin',
        passwordConfirmation: 'admin',
        email: 'admin@test.com'
      })
      .expect(403);
  });
});
