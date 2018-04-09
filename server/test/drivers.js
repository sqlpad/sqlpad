const assert = require('assert')
const drivers = require('../drivers')

describe('drivers', function() {
  it('loads and exposes api', function() {
    // This test doesn't test much will expand later
    assert(drivers)
    assert(typeof drivers.getSchema === 'function')
    assert(typeof drivers.runQuery === 'function')
    assert(typeof drivers.testConnection === 'function')
  })

  it('getDriverFieldsByName()', function() {
    const postgresFields = drivers.getDriverFieldsByName('postgres')
    assert(postgresFields.host, 'has host')
    assert(postgresFields.postgresSsl, 'has postgres specific field')
    assert(!postgresFields.sqlserverEncrypt, 'only has postgres fields')

    const allByDriverName = drivers.getDriverFieldsByName()
    assert(allByDriverName.crate, 'crate')
    assert(allByDriverName.hdb, 'hdb')
    assert(allByDriverName.mysql, 'mysql')
    assert(allByDriverName.postgres, 'postgres')
    assert(allByDriverName.presto, 'presto')
    assert(allByDriverName.sqlserver, 'sqlserver')
    assert(allByDriverName.vertica, 'vertica')
  })

  it('validateConnection()', function() {
    const validPostgres = drivers.validateConnection({
      name: 'testname',
      driver: 'postgres',
      host: 'host',
      port: 'port',
      postgresSsl: true,
      somethingStripped: 'shouldnotmakeit'
    })
    assert.equal(Object.keys(validPostgres).length, 5, 'only 5 keys valid')
    assert.equal(validPostgres.name, 'testname')
    assert.equal(validPostgres.driver, 'postgres')
    assert.equal(validPostgres.host, 'host')
    assert.equal(validPostgres.port, 'port')
    assert.equal(validPostgres.postgresSsl, true)

    assert.throws(() => {
      drivers.validateConnection({ name: 'name' })
    }, 'missing driver throws error')

    assert.throws(() => {
      drivers.validateConnection({ driver: 'postgres' })
    }, 'missing name throws error')

    assert.throws(() => {
      drivers.validateConnection({ name: 'name', driver: 'not exist' })
    }, 'missing driver imp throws error')

    assert.throws(() => {
      drivers.validateConnection({
        name: 'name',
        driver: 'postgres',
        postgresSsl: 'notboolean'
      })
    }, 'boolean not convertable throws error')
  })
})
