const assert = require('assert');
const request = require('supertest');
const TestUtil = require('../utils');

describe('api/signin', function() {
  describe('local auth', async function() {
    it('allows new user sign in', async function() {
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

      const agent = request.agent(utils.app);
      await agent
        .post('/api/signin')
        .send({
          password: 'admin',
          email: 'admin@test.com'
        })
        .expect(200);

      // agent should have session cookie to allow further action
      const r2 = await agent.get('/api/app');
      assert.equal(r2.body.currentUser.email, 'admin@test.com');
    });

    it('unauthorized for bad signin', async function() {
      const utils = new TestUtil({
        authProxyEnabled: false
      });

      await utils.init();

      await request(utils.app)
        .post('/api/signup')
        .send({
          email: 'admin@test.com',
          password: 'admin',
          passwordConfirmation: 'admin'
        })
        .expect(200);

      await request(utils.app)
        .post('/api/signin')
        .send({
          email: 'admin@test.com',
          password: 'wrong-password'
        })
        .expect(401);
    });

    it('supports case insensitive login', async function() {
      const utils = new TestUtil({
        authProxyEnabled: false
      });

      await utils.init();

      // Add admin user via signup
      await request(utils.app)
        .post('/api/signup')
        .send({
          password: 'admin',
          passwordConfirmation: 'admin',
          email: 'admin@test.com'
        })
        .expect(200);

      // Add user via API using admin
      await request(utils.app)
        .post('/api/users')
        .auth('admin@test.com', 'admin')
        .send({
          email: 'userCase@test.com',
          role: 'editor'
        })
        .expect(200);

      await request(utils.app)
        .post('/api/signup')
        .send({
          password: 'password',
          passwordConfirmation: 'password',
          email: 'Usercase@test.com'
        })
        .expect(200);
    });

    it('allows emails containing +', async function() {
      const utils = new TestUtil({
        authProxyEnabled: false
      });

      await utils.init();

      // Add admin user via signup
      await request(utils.app)
        .post('/api/signup')
        .send({
          password: 'admin',
          passwordConfirmation: 'admin',
          email: 'admin@test.com'
        })
        .expect(200);

      // Add user via API using admin
      await request(utils.app)
        .post('/api/users')
        .auth('admin@test.com', 'admin')
        .send({
          email: 'user+foobar@test.com',
          role: 'editor'
        })
        .expect(200);

      await request(utils.app)
        .post('/api/signup')
        .send({
          password: 'password',
          passwordConfirmation: 'password',
          email: 'user+foobar@test.com'
        })
        .expect(200);
    });
  });

  describe('auth proxy', function() {
    it('logs in with session', async function() {
      const utils = new TestUtil({
        authProxyEnabled: true,
        authProxyAutoSignUp: true,
        authProxyDefaultRole: 'admin',
        authProxyHeaders: 'email:X-WEBAUTH-EMAIL'
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
    });
  });
});
