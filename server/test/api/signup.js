const assert = require('assert');
const request = require('supertest');
const TestUtil = require('../utils');

describe('api/signup', function() {
  it('only allowed if local auth enabled', async function() {
    const utils = new TestUtil({
      disableUserpassAuth: 'true',
      authProxyEnabled: false
    });

    await utils.init();

    await request(utils.app)
      .post('/api/signup')
      .send({
        password: 'admin',
        passwordConfirmation: 'admin',
        email: 'admin@test.com'
      })
      .expect(403);
  });

  it('allows new user signup', async function() {
    const utils = new TestUtil({
      authProxyEnabled: false
    });
    await utils.init();

    const r1 = await request(utils.app)
      .post('/api/signup')
      .send({
        password: 'admin',
        passwordConfirmation: 'admin',
        email: 'admin@test.com'
      })
      .expect(200);

    assert(!r1.body.error, 'Expect no error');

    const agent = request.agent(utils.app);

    const r2 = await agent
      .post('/api/signin')
      .send({
        password: 'admin',
        email: 'admin@test.com'
      })
      .expect(200);
    assert(!r2.body.error, 'Expect no error');

    // agent should have session cookie to allow further action
    const r3 = await agent.get('/api/app');
    assert.equal(r3.body.currentUser.email, 'admin@test.com');
  });

  it('prevents duplicate signups', async function() {
    const utils = new TestUtil({
      authProxyEnabled: false
    });
    await utils.init();

    await request(utils.app)
      .post('/api/signup')
      .send({
        password: 'admin',
        passwordConfirmation: 'admin',
        email: 'admin@test.com'
      })
      .expect(200);

    const r2 = await request(utils.app)
      .post('/api/signup')
      .send({
        password: 'admin',
        passwordConfirmation: 'admin',
        email: 'admin@test.com'
      })
      .expect(200);

    assert(r2.body.error, 'Expect error user already signed up');
  });

  it('prevents open signups', async function() {
    const utils = new TestUtil({
      authProxyEnabled: false
    });
    await utils.init(true);

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
});
