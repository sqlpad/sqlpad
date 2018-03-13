const assert = require('assert')
const request = require('supertest')
const app = require('../../app')
const utils = require('../utils')

describe('api config-item & config-values', function() {
  before(function() {
    return utils.resetWithUser()
  })

  it('GET api/config-items (check default)', function() {
    return request(app)
      .get('/api/config-items')
      .auth('admin@test.com', 'admin')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(response => {
        const { configItems, error } = response.body
        assert(!error, 'Expect no error')
        const item = configItems.find(i => i.key === 'allowCsvDownload')
        assert.equal(
          item.default,
          item.effectiveValue,
          'default is effectiveValue'
        )
      })
  })

  it('POST api/config-values (change value)', function() {
    return request(app)
      .post('/api/config-values/allowCsvDownload')
      .auth('admin@test.com', 'admin')
      .send({
        value: false
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .then(response => {
        assert(!response.body.error, 'Expect no error')
      })
  })

  it('GET api/config-items (validate change)', function() {
    return request(app)
      .get('/api/config-items')
      .auth('admin@test.com', 'admin')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(response => {
        const { configItems, error } = response.body
        assert(!error, 'Expect no error')
        const item = configItems.find(i => i.key === 'allowCsvDownload')
        assert.equal(item.effectiveValue, false, 'default is effectiveValue')
      })
  })
})
