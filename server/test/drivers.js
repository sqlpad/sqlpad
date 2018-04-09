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
})
