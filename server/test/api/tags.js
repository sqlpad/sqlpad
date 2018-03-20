const assert = require('assert')
const utils = require('../utils')

describe('api/tags', function() {
  before(function() {
    return utils.resetWithUser()
  })

  it('Returns empty array', function() {
    return utils.get('admin', '/api/tags').then(body => {
      assert(!body.error, 'Expect no error')
      assert(Array.isArray(body.tags), 'tags is an array')
      assert.equal(body.tags.length, 0, '0 length')
    })
  })

  it('Returns expected array', function() {
    return Promise.all([
      utils
        .post('admin', '/api/queries', {
          name: 'test query',
          tags: ['one', 'two'],
          connectionId: 'TODO',
          queryText: 'select * from allStuff'
        })
        .then(body => assert(!body.error, 'no error')),
      utils
        .post('admin', '/api/queries', {
          name: 'test query',
          tags: ['one', 'three'],
          connectionId: 'TODO',
          queryText: 'select * from allStuff'
        })
        .then(body => assert(!body.error, 'no error'))
    ]).then(() =>
      utils.get('admin', '/api/tags').then(body => {
        assert(!body.error, 'Expect no error')
        assert.equal(body.tags.length, 3, '3 length')
      })
    )
  })
})
