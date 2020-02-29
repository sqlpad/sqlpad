const consts = require('../lib/consts');
const { Op } = require('sequelize');

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

  findAll() {
    return this.sequelizeDb.QueryAcl.findAll();
  }

  findAllByUser(user) {
    return this.sequelizeDb.QueryAcl.findAll({
      where: {
        [Op.or]: [
          { userId: user._id },
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
