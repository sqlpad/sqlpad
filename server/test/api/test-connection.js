const assert = require('assert');
const utils = require('../utils');

describe('api/test-connection', function() {
  before(function() {
    return utils.resetWithUser();
  });

  it('tests connection', async function() {
    const body = await utils.post('admin', '/api/test-connection', {
      name: 'test mock',
      driver: 'mock',
      host: 'localhost',
      database: 'sqlpad',
      username: 'sqlpad',
      password: 'sqlpad'
    });
    assert(!body.error, 'Expect no error');
  });
});
