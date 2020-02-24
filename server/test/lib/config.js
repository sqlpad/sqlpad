const assert = require('assert');
const { config } = require('../utils');

const fromDefault = require('../../lib/config/fromDefault');
const fromEnv = require('../../lib/config/fromEnv');
const fromCli = require('../../lib/config/fromCli');

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
  it('.get() should get a value provided by default', async function() {
    assert.equal(config.get('httpsPort'), 443, 'httpsPort=443');
  });
  it('.get() should only accept key in config items', async function() {
    assert.throws(() => config.get('non-existent-key'), Error);
  });
});
