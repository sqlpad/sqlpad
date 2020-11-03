const jwt = require('jsonwebtoken');

const maskToken = (token) => {
  return '********************'.concat(token.slice(-5));
};

class ServiceTokens {
  /**
   * @param {import('../sequelize-db')} sequelizeDb
   * @param {import('../lib/config')} config
   */
  constructor(sequelizeDb, config) {
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

    // Generate the token
    const token = jwt.sign(
      {
        name: data.name,
        role: data.role,
      },
      secret,
      signOpts
    );

    // Save only the masked token in the database
    data.maskedToken = maskToken(token);
    const newToken = await this.sequelizeDb.ServiceTokens.create(data);

    // Send the client the token only once
    const tokenToClient = JSON.parse(JSON.stringify(newToken));
    tokenToClient.token = token;

    return tokenToClient;
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
