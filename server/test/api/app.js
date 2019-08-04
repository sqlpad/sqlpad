const assert = require('assert');
const utils = require('../utils');

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
  it('returns expected values', async function() {
    const body = await utils.get(null, '/api/app');
    utils.expectKeys(body, expectedKeys);
    utils.expectKeys(body.config, expectedConfigKeys);
    assert.equal(
      Object.keys(body.config).length,
      expectedConfigKeys.length,
      'config should only have keys specified'
    );
  });

  it('handles unknown baseUrl', async function() {
    const body = await utils.get(null, '/literally/any/path/api/app');
    utils.expectKeys(body, expectedKeys);
  });
});
