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

function makeUsers(nedb) {
  async function save(data) {
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

    await nedb.users.update({ email: data.email }, joiResult.value, {
      upsert: true
    });
    return findOneByEmail(data.email);
  }

  function findOneByEmail(email) {
    return nedb.users.findOne({ email: { $regex: new RegExp(email, 'i') } });
  }

  function findOneById(id) {
    return nedb.users.findOne({ _id: id });
  }

  function findOneByPasswordResetId(passwordResetId) {
    return nedb.users.findOne({ passwordResetId });
  }

  function findAll() {
    return nedb.users
      .cfind({}, { password: 0, passhash: 0 })
      .sort({ email: 1 })
      .exec();
  }

  /**
   * Returns boolean regarding whether admin registration should be open or not
   * @returns {Promise<boolean>} administrationOpen
   */
  async function adminRegistrationOpen() {
    const doc = await nedb.users.findOne({ role: 'admin' });
    return !doc;
  }

  function removeById(id) {
    return nedb.users.remove({ _id: id });
  }

  return {
    findOneByEmail,
    findOneById,
    findOneByPasswordResetId,
    findAll,
    adminRegistrationOpen,
    removeById,
    save
  };
}

module.exports = makeUsers;
