const assert = require('assert');
const validateConnection = require('../../lib/validate-connection');

describe('drivers', function() {
  it('validateConnection()', function() {
    const validPostgres = validateConnection({
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
      validateConnection({ name: 'name' });
    }, 'missing driver throws error');

    assert.throws(() => {
      validateConnection({ driver: 'postgres' });
    }, 'missing name throws error');

    assert.throws(() => {
      validateConnection({ name: 'name', driver: 'not exist' });
    }, 'missing driver imp throws error');

    assert.throws(() => {
      validateConnection({
        name: 'name',
        driver: 'postgres',
        postgresSsl: 'notboolean'
      });
    }, 'boolean not convertable throws error');
  });
});
