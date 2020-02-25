const assert = require('assert');
const TestUtils = require('../utils');

function expectKeys(data, expectedKeys) {
  Object.keys(data).forEach(key =>
    assert(expectedKeys.includes(key), `expected key ${key}`)
  );
}

const expectedKeys = [
  'adminRegistrationOpen',
  'currentUser',
  'config',
  'version'
];

const expectedConfigKeys = [
  'baseUrl',
  'allowCsvDownload',
  'editorWordWrap',
  'publicUrl',
  'smtpConfigured',
  'googleAuthConfigured',
  'localAuthConfigured',
  'samlConfigured'
];

describe('api/app', function() {
  const utils = new TestUtils();

  before(function() {
    return utils.init(true);
  });

  it('returns expected values', async function() {
    const body = await utils.get(null, '/api/app');
    expectKeys(body, expectedKeys);
    expectKeys(body.config, expectedConfigKeys);
    assert.equal(
      Object.keys(body.config).length,
      expectedConfigKeys.length,
      'config should only have keys specified'
    );
  });

  it('handles unknown baseUrl', async function() {
    const body = await utils.get(null, '/literally/any/path/api/app');
    expectKeys(body, expectedKeys);
  });
});
