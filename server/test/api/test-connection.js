const TestUtils = require('../utils');

describe('api/test-connection', function() {
  const utils = new TestUtils();

  before(function() {
    return utils.init(true);
  });

  it('tests connection success', async function() {
    await utils.post('admin', '/api/test-connection', {
      name: 'test connection',
      driver: 'sqlite',
      filename: './test/fixtures/sales.sqlite'
    });
  });

  it('tests connection failure for invalid driver', async function() {
    await utils.post(
      'admin',
      '/api/test-connection',
      {
        name: 'test connection',
        driver: 'not-real-driver',
        filename: './test/fixtures/not-real-db'
      },
      500
    );
  });
});
