const assert = require('assert')
const request = require('supertest')
const app = require('../../app')
const utils = require('../utils')

describe('api/test-connection', function() {
  before(function() {
    return utils.resetWithUser()
  })

  describe('postgres', function() {
    it('tests postgres', function() {
      return request(app)
        .post('/api/test-connection')
        .auth('admin@test.com', 'admin')
        .send({
          name: 'test postgres',
          driver: 'postgres',
          host: 'localhost',
          database: 'sqlpad',
          username: 'sqlpad',
          password: 'sqlpad'
        })
        .expect('Content-Type', /json/)
        .expect(200)
        .then(response => {
          assert(!response.body.error, 'Expect no error')
        })
    })
  })

  // TODO add signout
  // TODO check for session once that is changed
})
