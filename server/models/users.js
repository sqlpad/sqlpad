const passhash = require('../lib/passhash.js');

class Users {
  /**
   * @param {import('../sequelize-db')} sequelizeDb
   * @param {import('../lib/config')} config
   */
  constructor(sequelizeDb, config) {
    this.sequelizeDb = sequelizeDb;
    this.config = config;
  }

  async create(data) {
    const { password, ...rest } = data;
    if (password) {
      rest.passhash = await passhash.getPasshash(password);
    }
    if (rest.email) {
      rest.email = rest.email.toLowerCase();
    }

    const newUser = await this.sequelizeDb.Users.create(rest);
    return this.findOneById(newUser.id);
  }

  async update(id, changes) {
    const { password, ...rest } = changes;
    if (password) {
      rest.passhash = await passhash.getPasshash(password);
    }
    if (rest.email) {
      rest.email = rest.email.toLowerCase();
    }

    await this.sequelizeDb.Users.update(rest, { where: { id } });
    return this.findOneById(id);
  }

  async findOneByEmail(email) {
    const user = await this.sequelizeDb.Users.findOne({
      where: { email: email.toLowerCase() },
    });
    return user && user.toJSON();
  }

  async findOneById(id) {
    const user = await this.sequelizeDb.Users.findOne({ where: { id } });
    return user && user.toJSON();
  }

  findOneByPasswordResetId(passwordResetId) {
    return this.sequelizeDb.Users.findOne({ where: { passwordResetId } });
  }

  findAll() {
    return this.sequelizeDb.Users.findAll({
      attributes: [
        'id',
        'name',
        'email',
        'role',
        'data',
        'signupAt',
        'createdAt',
        'updatedAt',
      ],
      order: [['email']],
    });
  }

  /**
   * Returns boolean regarding whether admin registration should be open or not
   * @returns {Promise<boolean>} administrationOpen
   */
  async adminRegistrationOpen() {
    const doc = await this.sequelizeDb.Users.findOne({
      attributes: ['id'],
      where: { role: 'admin' },
    });
    return !doc;
  }

  removeById(id) {
    return this.sequelizeDb.Users.destroy({ where: { id } });
  }
}

module.exports = Users;
