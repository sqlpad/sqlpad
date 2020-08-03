const assert = require('assert');
const request = require('supertest');
const TestUtils = require('../utils');

async function testSessionStore(sessionStore, additionalOpts = {}) {
  const utils = new TestUtils({
    authProxyEnabled: true,
    authProxyAutoSignUp: true,
    authProxyDefaultRole: 'admin',
    authProxyHeaders: 'email:X-WEBAUTH-EMAIL',
    sessionStore,
    ...additionalOpts,
  });
  await utils.init();

  const agent = request.agent(utils.app);

  // This signin call authenticates, auto-creates the user and creates a session
  await agent
    .post('/api/signin')
    .set('X-WEBAUTH-EMAIL', 'test@sqlpad.com')
    .expect(200);

  // agent should have session cookie to allow further action
  const r2 = await agent.get('/api/app');
  assert.equal(r2.body.currentUser.email, 'test@sqlpad.com');
}

describe('auth/session-stores', function () {
  it('file', async function () {
    return testSessionStore('file');
  });

  it('memory', async function () {
    return testSessionStore('memory');
  });

  it('database', async function () {
    return testSessionStore('database');
  });

  it('redis', async function () {
    const available = await TestUtils.redisAvailable('redis://localhost:6379');
    if (!available) {
      return this.skip();
    }
    return testSessionStore('redis', { redisUri: 'redis://localhost:6379' });
  });
});
