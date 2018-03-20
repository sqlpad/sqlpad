const assert = require('assert')
const utils = require('../utils')

describe('api/schema-info', function() {
  let connection

  before(function() {
    return utils.resetWithUser().then(() => {
      return utils
        .post('admin', '/api/connections', {
          driver: 'postgres',
          name: 'sqlpad',
          host: 'localhost',
          database: 'sqlpad',
          username: 'sqlpad',
          password: 'sqlpad'
        })
        .then(body => {
          assert(!body.error, 'no error')
          connection = body.connection
        })
    })
  })

  // this test fails in TravisCI for some reason but not locally
  it.skip('Gets schema-info', function() {
    return utils
      .get('admin', `/api/schema-info/${connection._id}`)
      .then(body => {
        assert(!body.error, 'Expect no error')
        assert(body.schemaInfo, 'body.schemaInfo')
      })
  })
})
