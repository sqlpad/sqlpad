const assert = require('assert');
const request = require('supertest');
const TestUtil = require('../utils');

describe('passport-proxy-auth', function () {
  it('auto sign up creates user w/default role', async function () {
    const utils = new TestUtil({
      authProxyEnabled: true,
      authProxyAutoSignUp: true,
      authProxyDefaultRole: 'editor',
      authProxyHeaders: 'email:X-WEBAUTH-EMAIL',
    });
    await utils.init();

    const { body } = await request(utils.app)
      .get('/api/users')
      .set('X-WEBAUTH-EMAIL', 'test@sqlpad.com')
      .expect(200);

    const user = body[0];
    assert.equal(user.email, 'test@sqlpad.com');
    assert.equal(user.role, 'editor');
  });

  it('Does not start session when used via middleware', async function () {
    const utils = new TestUtil({
      authProxyEnabled: true,
      authProxyAutoSignUp: true,
      authProxyDefaultRole: 'editor',
      authProxyHeaders: 'email:X-WEBAUTH-EMAIL',
    });
    await utils.init();

    const agent = request.agent(utils.app);

    // This api call passively authenticates, auto-creates the user and returns api result
    await agent
      .get('/api/users')
      .set('X-WEBAUTH-EMAIL', 'test@sqlpad.com')
      .expect(200);

    // This call should respond, but with no current user
    const r2 = await agent.get('/api/app').expect(200);
    assert(!r2.body.currentUser);

    // This call requiring auth should respond 401
    await agent.get('/api/users').expect(401);
  });

  it('401 has expected errors object', async function () {
    // Don't care about what is actually tested here
    // other than to ensure the body has errors object
    // Rest of 401s can be trusted to be expected shape
    const utils = new TestUtil({
      authProxyEnabled: true,
      authProxyHeaders: 'email:X-WEBAUTH-EMAIL',
    });
    await utils.init();

    const res = await request(utils.app)
      .get('/api/users')
      .set('X-WEBAUTH-EMAIL', 'test@sqlpad.com')
      .expect(401);
    assert(res.body.title);
  });

  it('401 if auto sign up and missing default role', async function () {
    const utils = new TestUtil({
      authProxyEnabled: true,
      authProxyAutoSignUp: true,
      authProxyHeaders: 'email:X-WEBAUTH-EMAIL',
    });
    await utils.init();

    await request(utils.app)
      .get('/api/users')
      .set('X-WEBAUTH-EMAIL', 'test@sqlpad.com')
      .expect(401);
  });

  it('401 if auto sign up and missing email', async function () {
    const utils = new TestUtil({
      authProxyEnabled: true,
      authProxyAutoSignUp: true,
      authProxyHeaders:
        'id:X-WEBAUTH-ID name:X-WEBAUTH-NAME role:X-WEBAUTH-ROLE',
    });
    await utils.init();

    await request(utils.app)
      .get('/api/users')
      .set('X-WEBAUTH-ID', 'test001')
      .set('X-WEBAUTH-NAME', 'Test user')
      .set('X-WEBAUTH-ROLE', 'admin')
      .expect(401);
  });

  it('401 if missing id and email', async function () {
    const utils = new TestUtil({
      authProxyEnabled: true,
      authProxyAutoSignUp: true,
      authProxyHeaders:
        'id:X-WEBAUTH-ID email:X-WEBAUTH-EMAIL name:X-WEBAUTH-NAME role:X-WEBAUTH-ROLE',
    });
    await utils.init();

    await request(utils.app)
      .get('/api/users')
      .set('X-WEBAUTH-NAME', 'Test user')
      .set('X-WEBAUTH-ROLE', 'admin')
      .expect(401);
  });

  it('401 if user does not exist and auto sign up turned off', async function () {
    const utils = new TestUtil({
      authProxyEnabled: true,
      authProxyAutoSignUp: false,
      authProxyHeaders:
        'id:X-WEBAUTH-ID email:X-WEBAUTH-EMAIL name:X-WEBAUTH-NAME role:X-WEBAUTH-ROLE',
    });
    await utils.init();

    await request(utils.app)
      .get('/api/users')
      .set('X-WEBAUTH-ID', 'test001')
      .set('X-WEBAUTH-EMAIL', 'test@sqlpad.com')
      .set('X-WEBAUTH-NAME', 'Test user')
      .set('X-WEBAUTH-ROLE', 'admin')
      .expect(401);
  });

  it('401 if proxy auth turned off', async function () {
    const utils = new TestUtil({
      authProxyEnabled: false,
    });
    await utils.init();

    await request(utils.app)
      .get('/api/users')
      .set('X-WEBAUTH-ID', 'test001')
      .set('X-WEBAUTH-EMAIL', 'test@sqlpad.com')
      .set('X-WEBAUTH-NAME', 'Test user')
      .set('X-WEBAUTH-ROLE', 'admin')
      .expect(401);
  });

  it('All fields used for user without default role', async function () {
    const utils = new TestUtil({
      authProxyEnabled: true,
      authProxyAutoSignUp: true,
      authProxyHeaders:
        'id:X-WEBAUTH-ID email:X-WEBAUTH-EMAIL name:X-WEBAUTH-NAME role:X-WEBAUTH-ROLE data.customField:X-WEBAUTH-CUSTOM-FIELD',
    });
    await utils.init();

    const { body } = await request(utils.app)
      .get('/api/users')
      .set('X-WEBAUTH-ID', 'test001')
      .set('X-WEBAUTH-EMAIL', 'test@sqlpad.com')
      .set('X-WEBAUTH-NAME', 'Test user')
      .set('X-WEBAUTH-ROLE', 'admin')
      .set('X-WEBAUTH-CUSTOM-FIELD', 'custom data value')
      .expect(200);

    const user = body[0];
    assert.equal(user.email, 'test@sqlpad.com');
    assert.equal(user.role, 'admin');
    assert.equal(user.name, 'Test user');
    assert.equal(user.id, 'test001');
    assert.equal(user.data.customField, 'custom data value');
  });

  it('Matches existing user via email', async function () {
    const utils = new TestUtil({
      authProxyEnabled: true,
      authProxyHeaders: 'email:X-WEBAUTH-EMAIL',
    });
    await utils.init(true);

    const { body } = await request(utils.app)
      .get('/api/users')
      .set('X-WEBAUTH-EMAIL', 'admin@test.com')
      .expect(200);

    const user = body.find((user) => user.email === 'admin@test.com');
    assert.equal(user.role, 'admin');
  });

  it('Matches existing user via id', async function () {
    const utils = new TestUtil({
      authProxyEnabled: true,
      authProxyHeaders: 'id:X-WEBAUTH-ID',
    });
    await utils.init(true);

    const id = utils.users.admin.id;

    const { body } = await request(utils.app)
      .get('/api/users')
      .set('X-WEBAUTH-ID', id)
      .expect(200);

    const user = body.find((user) => user.id === id);
    assert.equal(user.role, 'admin');
  });

  it('Matches existing user via id', async function () {
    const utils = new TestUtil({
      authProxyEnabled: true,
      authProxyHeaders: 'id:X-WEBAUTH-ID',
    });
    await utils.init(true);

    const id = utils.users.admin.id;

    const { body } = await request(utils.app)
      .get('/api/users')
      .set('X-WEBAUTH-ID', id)
      .expect(200);

    const user = body.find((user) => user.id === id);
    assert.equal(user.role, 'admin');
  });

  it('Updates existing user if changes', async function () {
    const utils = new TestUtil({
      authProxyEnabled: true,
      authProxyAutoSignUp: true,
      authProxyHeaders: 'email:X-WEBAUTH-EMAIL name:X-WEBAUTH-NAME',
    });
    await utils.init(true);

    const { body } = await request(utils.app)
      .get('/api/users')
      .set('X-WEBAUTH-EMAIL', 'admin@test.com')
      .set('X-WEBAUTH-NAME', 'New admin name')
      .expect(200);

    const user = body.find((user) => user.email === 'admin@test.com');
    assert.equal(user.name, 'New admin name');
  });

  it('User not updated if no changes', async function () {
    const utils = new TestUtil({
      authProxyEnabled: true,
      authProxyAutoSignUp: true,
      authProxyHeaders: 'email:X-WEBAUTH-EMAIL name:X-WEBAUTH-NAME',
    });
    await utils.init(true);

    const response1 = await request(utils.app)
      .get('/api/users')
      .set('X-WEBAUTH-EMAIL', 'admin@test.com')
      .set('X-WEBAUTH-NAME', 'New admin name')
      .expect(200);

    const user1 = response1.body.find(
      (user) => user.email === 'admin@test.com'
    );
    assert.equal(user1.name, 'New admin name');

    await new Promise((resolve) => setTimeout(resolve, 100));

    const response2 = await request(utils.app)
      .get('/api/users')
      .set('X-WEBAUTH-EMAIL', 'admin@test.com')
      .set('X-WEBAUTH-NAME', 'New admin name')
      .expect(200);
    const user2 = response2.body.find(
      (user) => user.email === 'admin@test.com'
    );

    assert.equal(user1.updatedAt, user2.updatedAt);
  });
});
