const assert = require('assert');
const jwt = require('jsonwebtoken');
const TestUtils = require('../utils');

describe('api/service-tokens', function() {
  const serviceTokenSecret = 'secr3t';
  const utils = new TestUtils({ serviceTokenSecret });
  const utilsNoJwtSecret = new TestUtils();

  before(async function() {
    await utils.init(true);
    await utilsNoJwtSecret.init(true);
  });

  it('Returns empty array', async function() {
    const body = await utils.get('admin', '/api/service-tokens');
    assert(!body.error, 'no error');
    assert(Array.isArray(body.serviceTokens), 'serviceTokens is an array');
    assert.equal(body.serviceTokens.length, 0, '0 length');
  });

  it('Creates service token without no secret', async function() {
    const body = await utilsNoJwtSecret.post('admin', '/api/service-tokens', {
      name: 'Test Service Token - Infinite',
      role: 'admin'
    });

    assert(body.error, 'error');
    assert.equal(
      body.error,
      'Service Token (JWT) Secret not defined in server config'
    );
  });

  it('Creates service token without expiry date', async function() {
    const body = await utils.post('admin', '/api/service-tokens', {
      name: 'Test Service Token - Infinite',
      role: 'editor'
    });

    assert(!body.error, 'no error');
    assert(body.serviceToken.name, 'has name');
    assert(body.serviceToken.role, 'has role');
    assert(body.serviceToken.maskedToken, 'has maskedToken');
    assert(body.serviceToken.token, 'has token');
    assert(!body.serviceToken.expiryDate, 'no expiryDate');

    const decodedTokenPayload = jwt.verify(
      body.serviceToken.token,
      serviceTokenSecret
    );
    assert.equal(decodedTokenPayload.name, 'Test Service Token - Infinite');
    assert.equal(decodedTokenPayload.role, 'editor');
    assert(decodedTokenPayload.iat, 'has issued at');
    assert(!decodedTokenPayload.exp, 'no expiration time');
  });

  it('Creates service token with expiry date', async function() {
    const body = await utils.post('admin', '/api/service-tokens', {
      name: 'Test Service Token',
      role: 'admin',
      duration: 168
    });

    assert(!body.error, 'no error');
    assert(body.serviceToken.name, 'has name');
    assert(body.serviceToken.role, 'has role');
    assert(body.serviceToken.maskedToken, 'has maskedToken');
    assert(body.serviceToken.token, 'has token');
    assert(body.serviceToken.expiryDate, 'has expiryDate');

    const decodedTokenPayload = jwt.verify(
      body.serviceToken.token,
      serviceTokenSecret
    );
    assert.equal(decodedTokenPayload.name, 'Test Service Token');
    assert.equal(decodedTokenPayload.role, 'admin');
    assert(decodedTokenPayload.iat, 'has issued at');
    assert(decodedTokenPayload.exp, 'has expiration time');
  });

  it('Re-creates service token with existing name', async function() {
    const body = await utils.post('admin', '/api/service-tokens', {
      name: 'Test Service Token',
      role: 'admin',
      duration: 168
    });

    assert(body.error, 'error');
    assert.equal(body.error, 'Service token already exists');
  });

  it('Delete and get service tokens', async function() {
    // Delete an existing token
    const bodyDel = await utils.del('admin', '/api/service-tokens/1');
    assert(!bodyDel.error, 'no error');

    // Get tokens after delete, expecting one entry
    const bodyGet = await utils.get('admin', '/api/service-tokens');
    assert(!bodyGet.error, 'no error');
    assert(Array.isArray(bodyGet.serviceTokens), 'serviceTokens is an array');
    assert.equal(bodyGet.serviceTokens.length, 1, '1 length');
  });
});
