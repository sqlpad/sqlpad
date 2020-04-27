const assert = require('assert');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const TestUtils = require('../utils');

describe('api/service-tokens', function() {
  const serviceTokenSecret = 'secr3t';
  const utils = new TestUtils({ serviceTokenSecret });
  const utilsNoJwtSecret = new TestUtils();
  let editorServiceToken;
  let adminServiceToken;

  before(async function() {
    await utils.init(true);
    await utilsNoJwtSecret.init(true);
  });

  it('Returns empty array', async function() {
    const body = await utils.get('admin', '/api/service-tokens');
    TestUtils.validateListSuccessBody(body);
    assert.equal(body.length, 0, '0 length');
  });

  it('Creates service token without no secret', async function() {
    await utilsNoJwtSecret.post(
      'admin',
      '/api/service-tokens',
      {
        name: 'Test Service Token - Infinite',
        role: 'admin'
      },
      403
    );
  });

  it('Creates service token without expiry date', async function() {
    editorServiceToken = await utils.post('admin', '/api/service-tokens', {
      name: 'Test Service Token - Infinite',
      role: 'editor'
    });
    assert(editorServiceToken.id, 'has id');
    assert(editorServiceToken.name, 'has name');
    assert(editorServiceToken.role, 'has role');
    assert(editorServiceToken.maskedToken, 'has maskedToken');
    assert(editorServiceToken.token, 'has token');
    assert(!editorServiceToken.expiryDate, 'no expiryDate');

    const decodedTokenPayload = jwt.verify(
      editorServiceToken.token,
      serviceTokenSecret
    );
    assert.equal(decodedTokenPayload.name, 'Test Service Token - Infinite');
    assert.equal(decodedTokenPayload.role, 'editor');
    assert(decodedTokenPayload.iat, 'has issued at');
    assert(!decodedTokenPayload.exp, 'no expiration time');
  });

  it('Creates service token with expiry date', async function() {
    adminServiceToken = await utils.post('admin', '/api/service-tokens', {
      name: 'Test Service Token',
      role: 'admin',
      duration: 168
    });

    assert(adminServiceToken.id, 'has id');
    assert(adminServiceToken.name, 'has name');
    assert(adminServiceToken.role, 'has role');
    assert(adminServiceToken.maskedToken, 'has maskedToken');
    assert(adminServiceToken.token, 'has token');
    assert(adminServiceToken.expiryDate, 'has expiryDate');

    const decodedTokenPayload = jwt.verify(
      adminServiceToken.token,
      serviceTokenSecret
    );
    assert.equal(decodedTokenPayload.name, 'Test Service Token');
    assert.equal(decodedTokenPayload.role, 'admin');
    assert(decodedTokenPayload.iat, 'has issued at');
    assert(decodedTokenPayload.exp, 'has expiration time');
  });

  it('Re-creates service token with existing name', async function() {
    const body = await utils.post(
      'admin',
      '/api/service-tokens',
      {
        name: 'Test Service Token',
        role: 'admin',
        duration: 168
      },
      400
    );
    assert.equal(body.title, 'Service token already exists');
  });

  it('Accessing API endpoint without service token', async function() {
    await request(utils.app)
      .get('/api/users')
      .expect(401);
  });

  it('Accessing API endpoint with invalid service token', async function() {
    await request(utils.app)
      .get('/api/users')
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer invalid.jwt.token')
      .expect(401);
  });

  it('Accessing API endpoint with valid service token', async function() {
    await request(utils.app)
      .get('/api/users')
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer ' + editorServiceToken.token)
      .expect(200);
  });

  it('Accessing API restricted endpoint with valid service token and no permission', async function() {
    await request(utils.app)
      .get('/api/service-tokens')
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer ' + editorServiceToken.token)
      .expect(403);
  });

  it('Accessing restricted API endpoint with valid service token and permission', async function() {
    await request(utils.app)
      .get('/api/service-tokens')
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer ' + adminServiceToken.token)
      .expect(200);
  });

  it('Delete and get service tokens', async function() {
    // Delete the admin service token
    await utils.del('admin', '/api/service-tokens/' + adminServiceToken.id);

    // Get tokens after delete, expecting one entry
    const bodyGet = await utils.get('admin', '/api/service-tokens');
    TestUtils.validateListSuccessBody(bodyGet);
    assert.equal(bodyGet.length, 1, '1 length');
  });

  it('Accessing API restricted endpoint with deleted service token', async function() {
    await request(utils.app)
      .get('/api/service-tokens')
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer ' + adminServiceToken.token)
      .expect(401);
  });
});
