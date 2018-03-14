const assert = require('assert')
const request = require('supertest')
const app = require('../../app')
const utils = require('../utils')

describe('api/schema-info', function() {
  let connection

  before(function() {
    return utils.resetWithUser().then(() => {
      return request(app)
        .post('/api/connections')
        .auth('admin@test.com', 'admin')
        .send({
          driver: 'postgres',
          name: 'sqlpad',
          host: 'localhost',
          database: 'sqlpad',
          username: 'sqlpad',
          password: 'sqlpad'
        })
        .expect(200)
        .then(response => {
          const { body } = response
          assert(!body.error, 'no error')
          connection = body.connection
        })
    })
  })

  it('Gets schema-info', function() {
    return request(app)
      .get(`/api/schema-info/${connection._id}`)
      .auth('admin@test.com', 'admin')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(response => {
        const { body } = response
        assert(!body.error, 'Expect no error')
        assert(body.schemaInfo, 'body.schemaInfo')
      })
  })
})
