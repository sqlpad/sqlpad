const Joi = require('joi');
const db = require('../lib/db.js');
const bcrypt = require('bcrypt-nodejs');

const schema = {
  _id: Joi.string().optional(), // will be auto-gen by nedb
  email: Joi.string().required(),
  role: Joi.string()
    .lowercase()
    .allow('admin', 'editor', 'viewer'),
  passwordResetId: Joi.string()
    .guid()
    .optional()
    .empty(''),
  passhash: Joi.string().optional(), // may not exist if user hasn't signed up yet
  password: Joi.string()
    .optional()
    .strip(),
  createdDate: Joi.date().default(new Date(), 'time of creation'),
  modifiedDate: Joi.date().default(new Date(), 'time of modification'),
  signupDate: Joi.date().optional()
};

function User(data) {
  this._id = data._id;
  this.email = data.email;
  this.role = data.role;
  this.passwordResetId = data.passwordResetId;
  this.passhash = data.passhash;
  this.password = data.password;
  this.createdDate = data.createdDate;
  this.modifiedDate = data.modifiedDate;
  this.signupDate = data.signupDate;
}

User.prototype.save = function save() {
  const self = this;
  this.modifiedDate = new Date();
  return Promise.resolve()
    .then(() => {
      // if user has password set, we need to hash it before saving
      if (this.password) {
        return new Promise((resolve, reject) => {
          bcrypt.hash(this.password, null, null, (err, hash) => {
            if (err) {
              return reject(err);
            }
            self.passhash = hash;
            return resolve();
          });
        });
      }
    })
    .then(() => {
      // validate and save
      const joiResult = Joi.validate(self, schema);
      if (joiResult.error) {
        return Promise.reject(joiResult.error);
      }
      return db.users
        .update({ email: self.email }, joiResult.value, { upsert: true })
        .then(() => User.findOneByEmail(self.email));
    });
};

/**
 * Compare password to hash. Returns promise
 * @param {string} password
 */
User.prototype.comparePasswordToHash = function comparePasswordToHash(
  password
) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, this.passhash, (err, isMatch) => {
      if (err) {
        return reject(err);
      }
      resolve(isMatch);
    });
  });
};

/*  Query methods
============================================================================== */
User.findOneByEmail = email =>
  db.users
    .findOne({ email: { $regex: new RegExp(email, 'i') } })
    .then(doc => doc && new User(doc));

User.findOneById = id =>
  db.users.findOne({ _id: id }).then(doc => doc && new User(doc));

User.findOneByPasswordResetId = id =>
  db.users.findOne({ passwordResetId: id }).then(doc => doc && new User(doc));

User.findAll = () =>
  db.users
    .cfind({}, { password: 0, passhash: 0 })
    .sort({ email: 1 })
    .exec()
    .then(docs => docs.map(doc => new User(doc)));

/**
 * Returns boolean regarding whether admin registration should be open or not
 * @returns {Promise<boolean>} administrationOpen
 */
User.adminRegistrationOpen = () =>
  db.users.findOne({ role: 'admin' }).then(doc => !doc);

User.removeOneById = id => db.users.remove({ _id: id });

module.exports = User;
