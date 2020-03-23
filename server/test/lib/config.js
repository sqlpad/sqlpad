const assert = require('assert');
const TestUtils = require('../utils');
const fromDefault = require('../../lib/config/from-default');
const fromEnv = require('../../lib/config/from-env');
const fromCli = require('../../lib/config/from-cli');

describe('config', function() {
  it('default', function() {
    const conf = fromDefault();
    assert.equal(conf.port, 80, 'default port');
    assert(conf.dbPath !== '$HOME/sqlpad/db', 'dbPath should change');
  });

  it('env', function() {
    const conf = fromEnv({ SQLPAD_PORT: 8000 });
    assert.equal(conf.port, 8000, 'conf.port');
  });

  it('cli', function() {
    const conf = fromCli({
      keyPath: 'key/path',
      certPath: 'cert/path',
      admin: 'admin@email.com'
    });
    assert.equal(conf.keyPath, 'key/path', 'keyPath');
    assert.equal(conf.certPath, 'cert/path', 'certPath');
    assert.equal(conf.admin, 'admin@email.com', 'admin');
  });
});

describe('lib/config', function() {
  const utils = new TestUtils();

  before(function() {
    return utils.init(true);
  });

  it('.get() should get a value provided by default', async function() {
    assert.equal(utils.config.get('httpsPort'), 443, 'httpsPort=443');
  });
  it('.get() should only accept key in config items', async function() {
    assert.throws(() => utils.config.get('non-existent-key'), Error);
  });
});
