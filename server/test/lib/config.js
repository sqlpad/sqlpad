const assert = require('assert');
const path = require('path');
const fromDefault = require('../../lib/config/from-default');
const fromEnv = require('../../lib/config/from-env');
const fromCli = require('../../lib/config/from-cli');
const fromFile = require('../../lib/config/from-file');
const Config = require('../../lib/config');

describe('lib/config/from-default', function() {
  it('provides expected values', function() {
    const conf = fromDefault();
    assert.equal(conf.port, 80, 'default port');
    assert(conf.dbPath !== '$HOME/sqlpad/db', 'dbPath should change');
  });
});

describe('lib/config/from-env', function() {
  it('provides expected values', function() {
    const conf = fromEnv({ SQLPAD_PORT: 8000 });
    assert.equal(conf.port, 8000, 'conf.port');
  });
});

describe('lib/config/from-cli', function() {
  it('provides expected values', function() {
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

describe('lib/config/fromFile', function() {
  it('handles missing file', function() {
    const [config] = fromFile(path.join(__dirname, '/missing.ini'));
    assert.equal(Object.keys(config).length, 0, 'empty object');
  });

  it('reads INI', function() {
    const [config] = fromFile(path.join(__dirname, '../fixtures/config.ini'));
    assert.equal(config.dbPath, 'dbPath', 'dbPath');
    assert.equal(config.baseUrl, 'baseUrl', 'baseUrl');
    assert.equal(config.certPassphrase, 'certPassphrase', 'certPassphrase');
    assert.equal(Object.keys(config).length, 3, '3 items');
  });

  it('reads JSON', function() {
    const [config] = fromFile(path.join(__dirname, '../fixtures/config.json'));
    assert.equal(config.dbPath, 'dbPath', 'dbPath');
    assert.equal(config.baseUrl, 'baseUrl', 'baseUrl');
    assert.equal(config.certPassphrase, 'certPassphrase', 'certPassphrase');
    assert.equal(Object.keys(config).length, 3, '3 items');
  });

  it('Warns for old JSON', function() {
    const [config, warnings] = fromFile(
      path.join(__dirname, '../fixtures/old-config.json')
    );
    assert(config);
    assert.equal(warnings.length, 1, 'has warnings');
  });
});

describe('lib/config', function() {
  it('.get() should get a value provided by default', function() {
    const config = new Config({}, {});
    assert.equal(config.get('httpsPort'), 443, 'httpsPort=443');
  });

  it('.get() should only accept key in config items', function() {
    const config = new Config({}, {});
    assert.throws(() => config.get('non-existent-key'), Error);
  });

  it('cli args overrides env', function() {
    const config = new Config(
      {
        appLogLevel: 'warn'
      },
      {
        SQLPAD_APP_LOG_LEVEL: 'silent'
      }
    );
    assert.equal(config.get('appLogLevel'), 'warn');
  });

  it('env provides value expected', function() {
    const config = new Config(
      {
        appLogLevel: 'warn'
      },
      {
        SQLPAD_APP_LOG_LEVEL: 'silent',
        SQLPAD_WEB_LOG_LEVEL: 'silent'
      }
    );
    assert.equal(config.get('webLogLevel'), 'silent');
  });

  it('gets validation for missing dbPath', function() {
    const config = new Config({}, {});
    const { errors } = config.getValidations();
    assert(errors[0].includes('dbPath'));
  });
});
