const assert = require('assert');
const {
  getFromCli,
  getFromDefault,
  getFromEnv,
} = require('../../lib/config/config-utils');
const Config = require('../../lib/config');

function configHasError(args, errorFindFunction) {
  const config = new Config(args, {});
  const validations = config.getValidations();
  assert(validations.errors);
  const found = validations.errors.find(errorFindFunction);
  assert(found);
}

describe('lib/config/from-default', function () {
  it('provides expected values', function () {
    const conf = getFromDefault();
    assert.equal(conf.port, 80, 'default port');
    assert(conf.dbPath !== '$HOME/sqlpad/db', 'dbPath should change');
  });
});

describe('lib/config/from-env', function () {
  it('provides expected values', function () {
    const conf = getFromEnv({ SQLPAD_PORT: 8000 });
    assert.equal(conf.port, 8000, 'conf.port');
  });
});

describe('lib/config/from-cli', function () {
  it('provides expected values', function () {
    const conf = getFromCli({
      keyPath: 'key/path',
      certPath: 'cert/path',
      admin: 'admin@email.com',
    });
    assert.equal(conf.keyPath, 'key/path', 'keyPath');
    assert.equal(conf.certPath, 'cert/path', 'certPath');
    assert.equal(conf.admin, 'admin@email.com', 'admin');
  });
});

describe('lib/config', function () {
  it('Error: Unknown session store', function () {
    configHasError({ sessionStore: 'not-real-store' }, (error) =>
      error.includes('SQLPAD_SESSION_STORE must be one of')
    );
  });

  it('Error: Unknown query result store', function () {
    configHasError({ queryResultStore: 'not-real-store' }, (error) =>
      error.includes('SQLPAD_QUERY_RESULT_STORE must be one of')
    );
  });

  it('Error: redis store requires redis URI', function () {
    configHasError({ sessionStore: 'redis' }, (error) =>
      error.includes('Redis session store requires SQLPAD_REDIS_URI to be set')
    );
    configHasError({ queryResultStore: 'redis' }, (error) =>
      error.includes(
        'Redis query result store requires SQLPAD_REDIS_URI to be set'
      )
    );
  });

  it('Errors for old cli flag', function () {
    const config = new Config({ debug: true }, {});
    const validations = config.getValidations();
    assert(validations.errors);
    const found = validations.errors.find(
      (error) => error.includes('debug') && error.includes('NOT RECOGNIZED')
    );
    assert(found, 'has error about old key');
  });

  it('Errors for old env var', function () {
    const config = new Config({}, { SQLPAD_DEBUG: 'true' });
    const validations = config.getValidations();
    assert(validations.errors);
    const found = validations.errors.find(
      (error) =>
        error.includes('SQLPAD_DEBUG') && error.includes('NOT RECOGNIZED')
    );
    assert(found, 'has error about old key');
  });

  it('Warns for unknown env var', function () {
    const config = new Config({}, { SQLPAD_UNKNOWN_VAR: 'true' });
    const validations = config.getValidations();
    assert(validations.warnings);
    const found = validations.warnings.find(
      (warning) =>
        warning.includes('SQLPAD_UNKNOWN_VAR') &&
        warning.includes('NOT RECOGNIZED')
    );
    assert(found, 'has warning about unknown key');
  });

  it('Errors env connection missing name', function () {
    const config = new Config(
      {},
      { SQLPAD_CONNECTIONS__test__driver: 'postgres' }
    );
    const validations = config.getValidations();
    assert(validations.errors);
    const found = validations.errors.find((error) =>
      error.includes('SQLPAD_CONNECTIONS__test__name missing')
    );
    assert(found, 'has error');
  });

  it('Errors env connection missing driver', function () {
    const config = new Config(
      {},
      { SQLPAD_CONNECTIONS__test__name: 'My test' }
    );
    const validations = config.getValidations();
    assert(validations.errors);
    const found = validations.errors.find((error) =>
      error.includes('SQLPAD_CONNECTIONS__test__driver missing')
    );
    assert(found, 'has error');
  });

  it('Errors env connection invalid driver', function () {
    const config = new Config(
      {},
      {
        SQLPAD_CONNECTIONS__test__name: 'My test',
        SQLPAD_CONNECTIONS__test__driver: 'foo',
      }
    );
    const validations = config.getValidations();
    assert(validations.errors);
    const found = validations.errors.find((error) =>
      error.includes(
        'Environment config SQLPAD_CONNECTIONS__test__driver invalid. "foo" not a supported driver.'
      )
    );
    assert(found, 'has error');
  });

  it('Errors env connection invalid driver field', function () {
    const config = new Config(
      {},
      {
        SQLPAD_CONNECTIONS__test__name: 'My test',
        SQLPAD_CONNECTIONS__test__driver: 'postgres',
        SQLPAD_CONNECTIONS__test__wrongField: 'localhost',
      }
    );
    const validations = config.getValidations();
    assert(validations.errors);
    const found = validations.errors.find((error) =>
      error.includes(
        'Environment config SQLPAD_CONNECTIONS__test__wrongField invalid. "wrongField" not a known field for postgres.'
      )
    );
    assert(found, 'has error');
  });

  it('Warns for deprecated config', function () {
    const config = new Config({ deprecatedTestConfig: 'just a test' }, {});
    const validations = config.getValidations();
    assert(validations.warnings);
    const found = validations.warnings.find(
      (warning) =>
        warning.includes('deprecatedTestConfig') &&
        warning.includes('DEPRECATED')
    );
    assert(found, 'has deprecated key warning');
  });

  it('.get() should get a value provided by default', function () {
    const config = new Config({}, {});
    assert.equal(config.get('ip'), '0.0.0.0');
  });

  it('.get() should only accept key in config items', function () {
    const config = new Config({}, {});
    assert.throws(() => config.get('non-existent-key'), Error);
  });

  it('cli args overrides env', function () {
    const config = new Config(
      {
        appLogLevel: 'warn',
      },
      {
        SQLPAD_APP_LOG_LEVEL: 'silent',
      }
    );
    assert.equal(config.get('appLogLevel'), 'warn');
  });

  it('env provides value expected', function () {
    const config = new Config(
      {
        appLogLevel: 'warn',
      },
      {
        SQLPAD_APP_LOG_LEVEL: 'silent',
        SQLPAD_WEB_LOG_LEVEL: 'silent',
      }
    );
    assert.equal(config.get('webLogLevel'), 'silent');
  });

  it('gets validation for missing dbPath', function () {
    const config = new Config({}, {});
    const { errors } = config.getValidations();
    assert(errors[0].includes('dbPath'));
  });
});
