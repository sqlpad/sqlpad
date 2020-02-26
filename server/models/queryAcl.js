const consts = require('../lib/consts');

// NOTE - because QueryAcl is driven off of Sequelize ORM model
// and not nedb (which is schemaless) I am skipping defining a Joi schema here.
// For info on what QueryAcl schema is, see sequelize/QueryAcl.js

class QueryAcl {
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

  findAllByUserId(userId) {
    return this.sequelizeDb.QueryAcl.findAll({
      where: { userId: [userId, consts.EVERYONE_ID] },
      raw: true
    });
  }

  findAllByQueryId(queryId) {
    return this.sequelizeDb.QueryAcl.findAll({
      where: { queryId },
      raw: true
    });
  }

  findOneById(id) {
    return this.sequelizeDb.QueryAcl.findOne({ where: { id }, raw: true });
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
