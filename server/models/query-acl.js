const consts = require('../lib/consts');
const { Op } = require('sequelize');

class QueryAcl {
  /**
   * @param {import('../sequelize-db')} sequelizeDb
   * @param {import('../lib/config')} config
   */
  constructor(sequelizeDb, config) {
    this.sequelizeDb = sequelizeDb;
    this.config = config;
  }

  findAll() {
    return this.sequelizeDb.QueryAcl.findAll();
  }

  findAllByUser(user) {
    return this.sequelizeDb.QueryAcl.findAll({
      where: {
        [Op.or]: [
          { userId: user.id },
          { userEmail: user.email },
          { groupId: consts.EVERYONE_ID }
        ]
      }
    });
  }

  findAllByQueryId(queryId) {
    return this.sequelizeDb.QueryAcl.findAll({
      where: { queryId }
    });
  }

  findOneById(id) {
    return this.sequelizeDb.QueryAcl.findOne({ where: { id } });
  }

  removeByQueryId(queryId) {
    return this.sequelizeDb.QueryAcl.destroy({ where: { queryId } });
  }

  removeById(id) {
    return this.sequelizeDb.QueryAcl.destroy({ where: { id } });
  }

  async bulkCreate(rows) {
    return this.sequelizeDb.QueryAcl.bulkCreate(rows);
  }

  async create(data) {
    return this.sequelizeDb.QueryAcl.create(data);
  }

  async update(id, data) {
    await this.sequelizeDb.QueryAcl.update(data, { where: { id } });
    return this.findOneById(id);
  }
}

module.exports = QueryAcl;
