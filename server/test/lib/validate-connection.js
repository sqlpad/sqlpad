const assert = require('assert');
const validateConnection = require('../../lib/validate-connection');

describe('drivers', function () {
  it('validateConnection() for old', function () {
    const validPostgres = validateConnection({
      name: 'testname',
      driver: 'postgres',
      host: 'host',
      port: 'port',
      postgresSsl: true,
      somethingStripped: 'shouldnotmakeit',
    });
    assert.equal(Object.keys(validPostgres).length, 3, 'only 3 keys valid');
    assert.equal(validPostgres.name, 'testname');
    assert.equal(validPostgres.driver, 'postgres');
    assert.equal(validPostgres.data.host, 'host');
    assert.equal(validPostgres.data.port, 'port');
    assert.equal(validPostgres.data.postgresSsl, true);
  });

  it('validateConnection() for current', function () {
    const validPostgres = validateConnection({
      name: 'testname',
      driver: 'postgres',
      data: {
        host: 'host',
        port: 'port',
        postgresSsl: true,
        somethingStripped: 'shouldnotmakeit',
      },
    });
    assert.equal(Object.keys(validPostgres).length, 3, 'only 3 keys valid');
    assert.equal(validPostgres.name, 'testname');
    assert.equal(validPostgres.driver, 'postgres');
    assert.equal(validPostgres.data.host, 'host');
    assert.equal(validPostgres.data.port, 'port');
    assert.equal(validPostgres.data.postgresSsl, true);
  });

  it('invalid bool throws', function () {
    assert.throws(() => {
      validateConnection({
        name: 'name',
        driver: 'postgres',
        postgresSsl: 'notboolean',
      });
    }, 'boolean not convertable throws error');
  });

  it('missing driver throws', function () {
    assert.throws(() => {
      validateConnection({ name: 'name' });
    }, 'missing driver throws error');
  });

  it('missing name throws', function () {
    assert.throws(() => {
      validateConnection({ driver: 'postgres' });
    }, 'missing name throws error');
  });

  it('missing driver imp throws', function () {
    assert.throws(() => {
      validateConnection({ name: 'name', driver: 'not exist' });
    }, 'missing driver imp throws error');
  });
});
