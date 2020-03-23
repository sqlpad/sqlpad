const Joi = require('@hapi/joi');
const jwt = require('jsonwebtoken');

const schema = Joi.object({
  _id: Joi.string().optional(), // will be auto-gen by nedb
  name: Joi.string().required(),
  role: Joi.string()
    .lowercase()
    .allow('admin', 'editor', 'viewer')
    .required(),
  maskedToken: Joi.string(),
  duration: Joi.number()
    .integer()
    .min(1)
    .max(365)
    .default(0),
  expiryDate: Joi.date(),
  createdDate: Joi.date().default(Date.now),
  modifiedDate: Joi.date().default(Date.now)
});

const maskToken = token => {
  return '********************'.concat(token.slice(-5));
};

class ServiceTokens {
  /**
   * @param {*} nedb
   * @param {*} sequelizeDb
   * @param {import('../lib/config')} config
   */
  constructor(nedb, sequelizeDb, config) {
    this.nedb = nedb;
    this.sequelizeDb = sequelizeDb;
    this.config = config;
  }

  async generate(data) {
    const secret = this.config.get('serviceTokenSecret');
    if (!secret) {
      return Promise.reject(
        'Service Token (JWT) Secret not defined in server config'
      );
    }

    const signOpts = {};
    // Duration received in hour, we convert JWT sign requires it in seconds
    if (data.duration > 0) {
      data.expiryDate = new Date(
        new Date().getTime() + data.duration * 1000 * 60 * 60
      );
      signOpts.expiresIn = data.duration * 60 * 60;
    }

    const token = jwt.sign(
      {
        name: data.name,
        role: data.role
      },
      secret,
      signOpts
    );

    data.modifiedDate = new Date();
    data.maskedToken = maskToken(token);

    const joiResult = schema.validate(data);
    if (joiResult.error) {
      return Promise.reject(joiResult.error);
    }

    await this.nedb.serviceTokens.update({ name: data.name }, joiResult.value, {
      upsert: true
    });

    data.token = token;
    return data;
  }

  findOneById(id) {
    return this.nedb.serviceTokens.findOne({ _id: id });
  }

  findOneByName(name) {
    return this.nedb.serviceTokens.findOne({ name });
  }

  async removeOneById(id) {
    return this.nedb.serviceTokens.remove({ _id: id });
  }

  findAll() {
    return this.nedb.serviceTokens
      .cfind({}, {})
      .sort({ createdDate: 1 })
      .exec();
  }
}

module.exports = ServiceTokens;
