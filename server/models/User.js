const Joi = require('joi');
const db = require('../lib/db.js');
const passhash = require('../lib/passhash.js');

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

User.prototype.save = async function save() {
  const self = this;
  this.modifiedDate = new Date();

  if (this.password) {
    this.passhash = await passhash.getPasshash(this.password);
  }

  // validate and save
  const joiResult = Joi.validate(self, schema);
  if (joiResult.error) {
    return Promise.reject(joiResult.error);
  }

  await db.users.update({ email: self.email }, joiResult.value, {
    upsert: true
  });
  return User.findOneByEmail(self.email);
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
