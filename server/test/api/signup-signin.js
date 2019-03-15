const assert = require('assert');
const utils = require('../utils');

describe('api/signup', function() {
  before(function() {
    return utils.reset();
  });

  it('allows new user signup', function() {
    return utils
      .post(null, '/api/signup', {
        password: 'admin',
        passwordConfirmation: 'admin',
        email: 'admin@test.com'
      })
      .then(body => assert(!body.error, 'Expect no error'));
  });

  it('prevents duplicate signups', function() {
    return utils
      .post(null, '/api/signup', {
        password: 'admin',
        passwordConfirmation: 'admin',
        email: 'admin@test.com'
      })
      .then(body => assert(body.error, 'Expect error user already signed up'));
  });

  it('prevents open signups', function() {
    return utils
      .post(null, '/api/signup', {
        password: 'notwhitelisted',
        passwordConfirmation: 'notwhitelisted',
        email: 'notwhitelisted@test.com'
      })
      .then(body => assert(body.error, 'Expect error needing whitelist'));
  });

  it('supports case insensitive login', function() {
    return utils
      .post('admin', '/api/users', {
        email: 'userCase@test.com',
        role: 'editor'
      })
      .then(body => {
        assert(!body.error, 'no error');
        return utils.post(null, '/api/signup', {
          password: 'password',
          passwordConfirmation: 'password',
          email: 'Usercase@test.com'
        });
      })
      .then(body => assert(!body.error, 'Expect no error'));
  });
});

describe('api/signin', function() {
  before(function() {
    return utils.resetWithUser();
  });
  it('signs in user', function() {
    return utils
      .post(null, '/api/signin', {
        password: 'admin',
        email: 'admin@test.com'
      })
      .then(body => assert(!body.error, 'Expect no error'));
  });
});
