const assert = require('assert');
const TestUtils = require('../utils');

describe('api/webhooks', function () {
  let hookServer = {};
  let utils;
  let user;

  // Will be added to in format
  // lastResponse.hookName.headers
  // lastResponse.hookName.body
  const lastResponse = {};

  before(async function () {
    hookServer = await TestUtils.makeHookServer('userCreated', lastResponse);

    utils = new TestUtils({
      port: 9000,
      publicUrl: 'http://mysqlpad.com',
      baseUrl: '/sqlpad',
      webhookSecret: 'secret',
      webhookUserCreatedUrl: hookServer.url,
    });
    return utils.init(true);
  });

  after(function (done) {
    hookServer.server.close(done);
  });

  it('userCreated', async function () {
    user = await utils.post('admin', '/sqlpad/api/users', {
      email: 'user1@test.com',
      name: 'user1',
      role: 'editor',
      data: {
        create: true,
      },
    });

    assert.deepStrictEqual(lastResponse.userCreated.body, {
      id: user.id,
      name: user.name,
      role: user.role,
      email: user.email,
      createdAt: user.createdAt,
    });
  });

  // Only need to test this once
  it('headers match', async function () {
    assert.equal(lastResponse.userCreated.headers['sqlpad-secret'], 'secret');
    assert.equal(
      lastResponse.userCreated.headers['sqlpad-url'],
      'http://mysqlpad.com:9000/sqlpad'
    );
  });

  // TODO add more webhook tests that test content here
});
