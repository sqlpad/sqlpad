const assert = require('assert')
const utils = require('../utils')

describe('api/drivers', function() {
  before(function() {
    return utils.resetWithUser()
  })

  it('gets drivers', function() {
    return utils.get('editor', '/api/drivers').then(body => {
      const { drivers, error } = body
      assert(!error, 'Expect no error')
      assert(drivers.find(i => i.id === 'postgres'), 'has postgres')
    })
  })
})
