const assert = require('assert')
const User = require('../../models/User.js')

describe('models/User.js', function() {
  const regularUser = new User({ email: 'regular@test.com', role: 'editor' })
  const adminUser = new User({ email: 'admin@test.com', role: 'admin' })
  const signedUpUser = new User({
    email: 'signedUp@test.com',
    role: 'editor',
    password: '1234'
  })

  before(function() {
    return User._removeAll()
  })

  describe('.openAdminRegistration()', function() {
    it('should return true if no admins exist', function(done) {
      User.adminRegistrationOpen(function(err, open) {
        assert.ifError(err)
        assert.equal(open, true, 'open=true')
        done()
      })
    })
    it('should return false if admin exist', function(done) {
      adminUser.save(function(err) {
        assert.ifError(err)
        User.adminRegistrationOpen(function(err, open) {
          assert.ifError(err)
          assert.equal(open, false, 'open=false')
          done()
        })
      })
    })
  })

  describe('new User', function() {
    it('should save without error', function(done) {
      regularUser.save(function(err) {
        assert.ifError(err)
        adminUser.save(function(err) {
          assert.ifError(err)
          signedUpUser.save(done)
        })
      })
    })
  })

  describe('.findAll()', function() {
    it('should return all the existing users', function(done) {
      User.findAll(function(err, users) {
        assert.ifError(err)
        assert.equal(users.length, 3, 'users.length')
        assert(users[0] instanceof User, 'instanceof User')
        done()
      })
    })
  })

  describe('.findOneByEmail()', function() {
    it('should return requested user', function(done) {
      User.findOneByEmail('admin@test.com', function(err, user) {
        assert.ifError(err)
        assert(user instanceof User, 'instanceof User')
        assert.equal(user.email, 'admin@test.com', 'user.email')
        assert.equal(user.role, 'admin', 'user.role')
        done()
      })
    })
  })

  describe('new User', function() {
    it('should save without error', function(done) {
      const user = new User({ email: '2@test.com' })
      user.save(done)
    })
    it('should have defaults populated', function(done) {
      User.findOneByEmail('regular@test.com', function(err, user) {
        assert.ifError(err)
        assert(user)
        assert(user.email)
        assert.equal(user.role, 'editor', 'user.role')
        assert(user instanceof User, 'instanceOf User')
        assert(user.createdDate instanceof Date)
        assert(user.modifiedDate instanceof Date)
        done()
      })
    })
  })

  describe('.comparePasswordToHash()', function() {
    it('should return true if password is a match', function(done) {
      User.findOneByEmail('signedUp@test.com', function(err, user) {
        assert.ifError(err)
        user.comparePasswordToHash('1234', function(err, isMatch) {
          assert.ifError(err)
          assert.equal(isMatch, true, 'isMatch')
          done()
        })
      })
    })
    it('should return false if password is not a match', function(done) {
      User.findOneByEmail('signedUp@test.com', function(err, user) {
        assert.ifError(err)
        user.comparePasswordToHash('wrongpassword', function(err, isMatch) {
          assert.ifError(err)
          assert.equal(isMatch, false, 'isMatch')
          done()
        })
      })
    })
  })
})
