const assert = require('assert');
const drivers = require('../drivers');

describe('drivers', function() {
  it('loads and exposes api', function() {
    // This test doesn't test much will expand later
    assert(drivers);
    assert(typeof drivers.getSchema === 'function');
    assert(typeof drivers.runQuery === 'function');
    assert(typeof drivers.testConnection === 'function');
  });

  it('getDrivers()', function() {
    const driverItems = drivers.getDrivers();
    assert(Array.isArray(driverItems), 'driverItems is array');
    assert(driverItems.find(item => item.id === 'crate'));
    assert(driverItems.find(item => item.id === 'hdb'));
    assert(driverItems.find(item => item.id === 'mysql'));
    assert(driverItems.find(item => item.id === 'postgres'));
    assert(driverItems.find(item => item.id === 'presto'));
    assert(driverItems.find(item => item.id === 'sqlserver'));
    assert(driverItems.find(item => item.id === 'vertica'));

    const postgres = driverItems.find(item => item.id === 'postgres');
    assert.equal(postgres.id, 'postgres');
    assert.equal(postgres.name, 'Postgres');
    assert(Array.isArray(postgres.fields));
    assert(
      postgres.fields.find(field => field.key === 'postgresSsl'),
      'has postgres specific field'
    );
    assert(
      !postgres.fields.find(field => field.key === 'sqlserverEncrypt'),
      'Does not have a SQL Server field'
    );
  });

  it('validateConnection()', function() {
    const validPostgres = drivers.validateConnection({
      name: 'testname',
      driver: 'postgres',
      host: 'host',
      port: 'port',
      postgresSsl: true,
      somethingStripped: 'shouldnotmakeit'
    });
    assert.equal(Object.keys(validPostgres).length, 5, 'only 5 keys valid');
    assert.equal(validPostgres.name, 'testname');
    assert.equal(validPostgres.driver, 'postgres');
    assert.equal(validPostgres.host, 'host');
    assert.equal(validPostgres.port, 'port');
    assert.equal(validPostgres.postgresSsl, true);

    assert.throws(() => {
      drivers.validateConnection({ name: 'name' });
    }, 'missing driver throws error');

    assert.throws(() => {
      drivers.validateConnection({ driver: 'postgres' });
    }, 'missing name throws error');

    assert.throws(() => {
      drivers.validateConnection({ name: 'name', driver: 'not exist' });
    }, 'missing driver imp throws error');

    assert.throws(() => {
      drivers.validateConnection({
        name: 'name',
        driver: 'postgres',
        postgresSsl: 'notboolean'
      });
    }, 'boolean not convertable throws error');
  });

  it('renders connection with user', function() {
    const secret = '123<>!@#$%^&*()-_+=';
    const user = {
      data: {
        secret
      }
    };
    const connection = {
      connectionString: '{{user.data.secret}}',
      singleStache: '{single}',
      port: 6543
    };
    const rendered = drivers.renderConnection(connection, user);
    assert.strictEqual(rendered.connectionString, secret);
    assert.strictEqual(rendered.singleStache, '{single}', 'single left alone');
    assert.strictEqual(rendered.port, 6543, 'number left alone');
  });

  it('renders connection without user', function() {
    const connection = {
      connectionString: 'test',
      singleStache: '{single}',
      port: 6543
    };
    const rendered = drivers.renderConnection(connection);
    assert.strictEqual(rendered.connectionString, 'test');
    assert.strictEqual(rendered.singleStache, '{single}');
  });
});
