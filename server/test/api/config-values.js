const assert = require('assert');
const utils = require('../utils');

describe('api config-item & config-values', function() {
  before(function() {
    return utils.resetWithUser();
  });

  it('GET api/config-items (check default)', function() {
    return utils.get('admin', '/api/config-items').then(body => {
      const { configItems, error } = body;
      assert(!error, 'Expect no error');
      const item = configItems.find(i => i.key === 'allowCsvDownload');
      assert.equal(
        item.default,
        item.effectiveValue,
        'default is effectiveValue'
      );
    });
  });

  it('POST api/config-values (change value)', function() {
    return utils
      .post('admin', '/api/config-values/allowCsvDownload', {
        value: false
      })
      .then(body => assert(!body.error, 'Expect no error'));
  });

  it('GET api/config-items (validate change)', function() {
    return utils.get('admin', '/api/config-items').then(body => {
      const { configItems, error } = body;
      assert(!error, 'Expect no error');
      const item = configItems.find(i => i.key === 'allowCsvDownload');
      assert.equal(item.effectiveValue, false, 'default is effectiveValue');
    });
  });
});
