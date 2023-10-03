const assert = require('assert');
const request = require('supertest');
const TestUtil = require('../utils');

describe('auth/disable-auth', function () {
  it('signs in with noauth user', async function () {
    const utils = new TestUtil({
      authDisabled: true,
    });
    await utils.init();

    const { body } = await request(utils.app).get('/api/users').expect(200);
    let user = body[0];
    assert.equal(user.id, 'noauth');
    assert.equal(user.role, 'editor');
    assert.equal(user.name, 'noauth');
    assert.equal(user.email, 'noauth@example.com');

    user = await utils.models.users.findOneById('noauth');
    assert.equal(user.id, 'noauth');
    assert.equal(user.role, 'editor');
    assert.equal(user.name, 'noauth');
    assert.equal(user.email, 'noauth@example.com');
  });

  it('authDisabledDefaultRole editor', async function () {
    const utils = new TestUtil({
      authDisabled: true,
      authDisabledDefaultRole: 'editor',
    });
    await utils.init();

    const { body } = await request(utils.app).get('/api/users').expect(200);
    let user = body[0];
    assert.equal(user.role, 'editor');

    user = await utils.models.users.findOneById('noauth');
    assert.equal(user.role, 'editor');
  });

  it('authDisabledDefaultRole admin', async function () {
    const utils = new TestUtil({
      authDisabled: true,
      authDisabledDefaultRole: 'admin',
    });
    await utils.init();

    const { body } = await request(utils.app).get('/api/users').expect(200);
    let user = body[0];
    assert.equal(user.role, 'admin');

    user = await utils.models.users.findOneById('noauth');
    assert.equal(user.role, 'admin');
  });
});
