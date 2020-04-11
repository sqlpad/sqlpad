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
    assert(Array.isArray(body.data), 'data is an array');
    assert.equal(body.data.length, 0, '0 length');
  });

  it('Creates service token without no secret', async function() {
    const body = await utilsNoJwtSecret.post(
      'admin',
      '/api/service-tokens',
      {
        name: 'Test Service Token - Infinite',
        role: 'admin'
      },
      403
    );
    assert.equal(body.errors[0].title, 'Forbidden');
  });

  it('Creates service token without expiry date', async function() {
    const body = await utils.post('admin', '/api/service-tokens', {
      name: 'Test Service Token - Infinite',
      role: 'editor'
    });

    assert(!body.error, 'no error');
    assert(body.data.id, 'has id');
    assert(body.data.name, 'has name');
    assert(body.data.role, 'has role');
    assert(body.data.maskedToken, 'has maskedToken');
    assert(body.data.token, 'has token');
    assert(!body.data.expiryDate, 'no expiryDate');

    const decodedTokenPayload = jwt.verify(body.data.token, serviceTokenSecret);
    assert.equal(decodedTokenPayload.name, 'Test Service Token - Infinite');
    assert.equal(decodedTokenPayload.role, 'editor');
    assert(decodedTokenPayload.iat, 'has issued at');
    assert(!decodedTokenPayload.exp, 'no expiration time');

    // Save the token
    editorServiceToken = body.data;
  });

  it('Creates service token with expiry date', async function() {
    const body = await utils.post('admin', '/api/service-tokens', {
      name: 'Test Service Token',
      role: 'admin',
      duration: 168
    });

    assert(body.data.id, 'has id');
    assert(body.data.name, 'has name');
    assert(body.data.role, 'has role');
    assert(body.data.maskedToken, 'has maskedToken');
    assert(body.data.token, 'has token');
    assert(body.data.expiryDate, 'has expiryDate');

    const decodedTokenPayload = jwt.verify(body.data.token, serviceTokenSecret);
    assert.equal(decodedTokenPayload.name, 'Test Service Token');
    assert.equal(decodedTokenPayload.role, 'admin');
    assert(decodedTokenPayload.iat, 'has issued at');
    assert(decodedTokenPayload.exp, 'has expiration time');

    // Save the token
    adminServiceToken = body.data;
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

    assert.equal(body.errors[0].title, 'Service token already exists');
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
    assert(Array.isArray(bodyGet.data), 'data is an array');
    assert.equal(bodyGet.data.length, 1, '1 length');
  });

  it('Accessing API restricted endpoint with deleted service token', async function() {
    await request(utils.app)
      .get('/api/service-tokens')
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer ' + adminServiceToken.token)
      .expect(401);
  });
});
