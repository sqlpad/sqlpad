// NOTE - because ServiceTokens is driven off of Sequelize ORM model
// and not nedb (which is schemaless) I am skipping defining a Joi schema here.
// For info on what QueryAcl schema is, see sequelize/QueryAcl.js

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
    await this.sequelizeDb.ServiceTokens.create(data);

    // Do not write the actual token into the database, send it back
    // to the client only once
    data.token = token;
    return data;
  }

  findOneById(id) {
    return this.sequelizeDb.ServiceTokens.findOne({ where: { id } });
  }

  findOneByName(name) {
    return this.sequelizeDb.ServiceTokens.findOne({ where: { name } });
  }

  async removeOneById(id) {
    return this.sequelizeDb.ServiceTokens.destroy({ where: { id } });
  }

  findAll() {
    return this.sequelizeDb.ServiceTokens.findAll();
  }
}

module.exports = ServiceTokens;
