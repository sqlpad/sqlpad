var Joi = require('joi')
var db = require('../lib/db.js')
var bcrypt = require('bcrypt-nodejs')
var _ = require('lodash')

var schema = {
  _id: Joi.string().optional(), // will be auto-gen by nedb
  email: Joi.string().required(),
  role: Joi.string().lowercase().allow('admin', 'editor', 'viewer'),
  passwordResetId: Joi.string().guid().optional().empty(''),
  passhash: Joi.string().optional(), // may not exist if user hasn't signed up yet
  password: Joi.string().optional().strip(),
  createdDate: Joi.date().default(new Date(), 'time of creation'),
  modifiedDate: Joi.date().default(new Date(), 'time of modification'),
  signupDate: Joi.date().optional()
}

var User = function User (data) {
  this._id = data._id
  this.email = data.email
  this.role = data.role
  this.passwordResetId = data.passwordResetId
  this.passhash = data.passhash
  this.password = data.password
  this.createdDate = data.createdDate
  this.modifiedDate = data.modifiedDate
  this.signupDate = data.signupDate
}

User.prototype.save = function UserSave (callback) {
  var self = this
  this.modifiedDate = new Date()

  // if user has password set, we need to hash it before saving
  if (this.password) {
    bcrypt.hash(this.password, null, null, function (err, hash) {
      if (err) return callback(err)
      self.passhash = hash
      validateAndSave()
    })
  } else {
    validateAndSave()
  }

  function validateAndSave () {
    var joiResult = Joi.validate(self, schema)
    if (joiResult.error) return callback(joiResult.error)
    db.users.update({email: self.email}, joiResult.value, {upsert: true}, function (err) {
      if (err) return callback(err)
      User.findOneByEmail(self.email, function (err, foundUser) {
        if (err || !foundUser) return callback(err)
        self = _.merge(self, foundUser)
        callback(err, foundUser)
      })
    })
  }
}

// callback receives (err, isMatch). isMatch is boolean
User.prototype.comparePasswordToHash = function comparePasswordToHash (password, callback) {
  bcrypt.compare(password, this.passhash, callback)
}

/*  Query methods
============================================================================== */

User.findOneByEmail = function UserFindByEmail (email, callback) {
  db.users.findOne({email: email}).exec(function (err, doc) {
    if (err) return callback(err)
    if (!doc) return callback()
    return callback(err, new User(doc))
  })
}

User.findOneById = function UserFindOneById (id, callback) {
  db.users.findOne({_id: id}).exec(function (err, doc) {
    if (err) return callback(err)
    if (!doc) return callback()
    return callback(err, new User(doc))
  })
}

User.findOneByPasswordResetId = function UserFindOneByPasswordResetId (id, callback) {
  db.users.findOne({passwordResetId: id}).exec(function (err, doc) {
    if (err) return callback(err)
    if (!doc) return callback()
    return callback(err, new User(doc))
  })
}

User.findAll = function UserFindAll (callback) {
  db.users.find({}, { password: 0, passhash: 0 }).sort({email: 1}).exec(function (err, docs) {
    if (err) return callback(err)
    var users = docs.map(function (doc) {
      return new User(doc)
    })
    callback(err, users)
  })
}

User.adminRegistrationOpen = function (callback) {
  // NOTE: previously open admin filter contained
  // createdDate: {$lte: new Date()}
  // (unsure why this was originally checked)
  db.users.findOne({role: 'admin'}, function (err, doc) {
    callback(err, (!doc))
  })
}

User.removeOneById = function UserRemoveOneById (id, callback) {
  db.users.remove({_id: id}, callback)
}

User._removeAll = function _removeAllUsers (callback) {
  db.users.remove({}, {multi: true}, callback)
}

module.exports = User
