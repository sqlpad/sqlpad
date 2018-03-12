const assert = require('assert')
const User = require('../../models/User.js')

describe('models/User.js', function() {
  let regularUser = new User({ email: 'regular@test.com', role: 'editor' })
  let adminUser = new User({ email: 'admin@test.com', role: 'admin' })
  let signedUpUser = new User({
    email: 'signedUp@test.com',
    role: 'editor',
    password: '1234'
  })

  before(function() {
    return User._removeAll()
  })

  describe('.openAdminRegistration()', function() {
    it('should return true if no admins exist', function() {
      return User.adminRegistrationOpen().then(open => {
        assert.equal(open, true, 'open=true')
      })
    })
    it('should return false if admin exist', function() {
      return adminUser
        .save()
        .then(user => {
          adminUser = user
          return User.adminRegistrationOpen()
        })
        .then(open => {
          assert.equal(open, false, 'open=false')
        })
    })
  })

  describe('new User', function() {
    it('should save without error', function() {
      return regularUser
        .save()
        .then(user => {
          regularUser = user
          return signedUpUser.save()
        })
        .then(user => {
          signedUpUser = user
        })
    })
  })

  describe('.findAll()', function() {
    it('should return all the existing users', function() {
      return User.findAll().then(users => {
        assert.equal(users.length, 3, 'users.length')
        assert(users[0] instanceof User, 'instanceof User')
      })
    })
  })

  describe('.findOneByEmail()', function() {
    it('should return requested user', function() {
      return User.findOneByEmail('admin@test.com').then(user => {
        assert(user instanceof User, 'instanceof User')
        assert.equal(user.email, 'admin@test.com', 'user.email')
        assert.equal(user.role, 'admin', 'user.role')
      })
    })
  })

  describe('new User', function() {
    it('should save without error', function() {
      const user = new User({ email: '2@test.com' })
      return user.save()
    })
    it('should have defaults populated', function() {
      return User.findOneByEmail('regular@test.com').then(user => {
        assert(user)
        assert(user.email)
        assert.equal(user.role, 'editor', 'user.role')
        assert(user instanceof User, 'instanceOf User')
        assert(user.createdDate instanceof Date)
        assert(user.modifiedDate instanceof Date)
      })
    })
  })

  describe('.comparePasswordToHash()', function() {
    it('should return true if password is a match', function() {
      return User.findOneByEmail('signedUp@test.com')
        .then(user => user.comparePasswordToHash('1234'))
        .then(isMatch => {
          assert.equal(isMatch, true, 'isMatch')
        })
    })
    it('should return false if password is not a match', function() {
      return User.findOneByEmail('signedUp@test.com')
        .then(user => user.comparePasswordToHash('wrongpassword'))
        .then(isMatch => {
          assert.equal(isMatch, false, 'isMatch')
        })
    })
  })
})
