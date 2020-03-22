const assert = require('assert');
const path = require('path');
const fromFile = require('../../lib/config/from-file');

describe('configFromFile', function() {
  it('handles missing file', function() {
    const [config] = fromFile(path.join(__dirname, '/missing.ini'));
    assert.equal(Object.keys(config).length, 0, 'empty object');
  });

  it('reads INI', function() {
    const [config] = fromFile(path.join(__dirname, '../fixtures/config.ini'));
    assert.equal(config.dbPath, 'dbPath', 'dbPath');
    assert.equal(config.baseUrl, 'baseUrl', 'baseUrl');
    assert.equal(config.certPassphrase, 'certPassphrase', 'certPassphrase');
    assert.equal(Object.keys(config).length, 3, '3 items');
  });

  it('reads JSON', function() {
    const [config] = fromFile(path.join(__dirname, '../fixtures/config.json'));
    assert.equal(config.dbPath, 'dbPath', 'dbPath');
    assert.equal(config.baseUrl, 'baseUrl', 'baseUrl');
    assert.equal(config.certPassphrase, 'certPassphrase', 'certPassphrase');
    assert.equal(Object.keys(config).length, 3, '3 items');
  });

  it('Warns for old JSON', function() {
    const [config, warnings] = fromFile(
      path.join(__dirname, '../fixtures/old-config.json')
    );
    assert(config);
    assert.equal(warnings.length, 1, 'has warnings');
  });
});
