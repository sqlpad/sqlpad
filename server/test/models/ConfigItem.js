const assert = require('assert')
const ConfigItem = require('../../models/ConfigItem.js')

describe('models/ConfigItem.js', function() {
  describe('findAll()', function() {
    it('should get array of ConfigItems', function() {
      return ConfigItem.findAll().then(configItems => {
        assert(configItems.length > 1, 'more than 1 item')
      })
    })
  })
})
