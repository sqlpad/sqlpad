const Joi = require('@hapi/joi');
const passhash = require('../lib/passhash.js');

const schema = Joi.object({
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
  createdDate: Joi.date().default(Date.now),
  modifiedDate: Joi.date().default(Date.now),
  signupDate: Joi.date().optional()
});

class Users {
  constructor(nedb) {
    this.nedb = nedb;
  }

  async save(data) {
    if (!data.email) {
      throw new Error('email required when saving user');
    }

    data.modifiedDate = new Date();

    if (data.password) {
      data.passhash = await passhash.getPasshash(data.password);
    }

    const joiResult = schema.validate(data);
    if (joiResult.error) {
      return Promise.reject(joiResult.error);
    }

    await this.nedb.users.update({ email: data.email }, joiResult.value, {
      upsert: true
    });
    return this.findOneByEmail(data.email);
  }

  findOneByEmail(email) {
    return this.nedb.users.findOne({
      email: { $regex: new RegExp(email, 'i') }
    });
  }

  findOneById(id) {
    return this.nedb.users.findOne({ _id: id });
  }

  findOneByPasswordResetId(passwordResetId) {
    return this.nedb.users.findOne({ passwordResetId });
  }

  findAll() {
    return this.nedb.users
      .cfind({}, { password: 0, passhash: 0 })
      .sort({ email: 1 })
      .exec();
  }

  /**
   * Returns boolean regarding whether admin registration should be open or not
   * @returns {Promise<boolean>} administrationOpen
   */
  async adminRegistrationOpen() {
    const doc = await this.nedb.users.findOne({ role: 'admin' });
    return !doc;
  }

  removeById(id) {
    return this.nedb.users.remove({ _id: id });
  }
}

module.exports = Users;
