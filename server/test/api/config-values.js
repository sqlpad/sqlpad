const assert = require('assert');
const utils = require('../utils');

describe('api config-item & config-values', function() {
  before(function() {
    return utils.resetWithUser();
  });

  it('GET api/config-items (check default)', async function() {
    const body = await utils.get('admin', '/api/config-items');
    const { configItems, error } = body;
    assert(!error, 'Expect no error');
    const item = configItems.find(i => i.key === 'allowCsvDownload');
    assert.equal(
      item.default,
      item.effectiveValue,
      'default is effectiveValue'
    );
  });

  it('POST api/config-values (change value)', async function() {
    const body = await utils.post(
      'admin',
      '/api/config-values/allowCsvDownload',
      {
        value: false
      }
    );
    assert(!body.error, 'Expect no error');
  });

  it('GET api/config-items (validate change)', async function() {
    const body = await utils.get('admin', '/api/config-items');
    const { configItems, error } = body;
    assert(!error, 'Expect no error');
    const item = configItems.find(i => i.key === 'allowCsvDownload');
    assert.equal(item.effectiveValue, false, 'default is effectiveValue');
  });
});
