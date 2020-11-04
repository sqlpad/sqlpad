const assert = require('assert');
const request = require('supertest');
const TestUtil = require('../utils');

describe('api/signup', function () {
  it('only allowed if local auth enabled', async function () {
    const utils = new TestUtil({
      userpassAuthDisabled: 'true',
      authProxyEnabled: false,
      admin: 'admin@test.com',
    });

    await utils.init();

    await request(utils.app)
      .post('/api/signup')
      .send({
        password: 'admin',
        passwordConfirmation: 'admin',
        email: 'admin@test.com',
      })
      .expect(403);
  });

  it('allows new user signup', async function () {
    const utils = new TestUtil({
      authProxyEnabled: false,
      admin: 'admin@test.com',
    });
    await utils.init();

    await request(utils.app)
      .post('/api/signup')
      .send({
        password: 'admin',
        passwordConfirmation: 'admin',
        email: 'admin@test.com',
      })
      .expect(200);

    const agent = request.agent(utils.app);

    await agent
      .post('/api/signin')
      .send({
        password: 'admin',
        email: 'admin@test.com',
      })
      .expect(200);

    // agent should have session cookie to allow further action
    const r3 = await agent.get('/api/app');
    assert.equal(r3.body.currentUser.email, 'admin@test.com');
  });

  it('prevents duplicate signups', async function () {
    const utils = new TestUtil({
      authProxyEnabled: false,
      admin: 'admin@test.com',
    });
    await utils.init();

    await request(utils.app)
      .post('/api/signup')
      .send({
        password: 'admin',
        passwordConfirmation: 'admin',
        email: 'admin@test.com',
      })
      .expect(200);

    await request(utils.app)
      .post('/api/signup')
      .send({
        password: 'admin',
        passwordConfirmation: 'admin',
        email: 'admin@test.com',
      })
      .expect(400);
  });

  it('prevents open signups', async function () {
    const utils = new TestUtil({
      authProxyEnabled: false,
    });
    await utils.init(true);

    await request(utils.app)
      .post('/api/signup')
      .send({
        password: 'notAllowed',
        passwordConfirmation: 'notAllowed',
        email: 'notAllowed@test.com',
      })
      .expect(403);
  });
});
