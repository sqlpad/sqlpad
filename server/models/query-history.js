class QueryHistory {
  /**
   * @param {import('../sequelize-db')} sequelizeDb
   * @param {import('../lib/config')} config
   */
  constructor(sequelizeDb, config) {
    this.sequelizeDb = sequelizeDb;
    this.config = config;
  }

  findOneById(id) {
    return this.sequelizeDb.QueryHistory.findOne({ where: { id } });
  }

  async findAll() {
    return this.sequelizeDb.QueryHistory.findAll({
      order: [['startTime', 'DESC']],
    });
  }

  findByFilter(filter) {
    return this.sequelizeDb.QueryHistory.findAll({
      where: filter,
      order: [['startTime', 'DESC']],
    });
  }

  /**
   * Save queryHistory object
   * returns saved queryHistory object
   * @param {object} queryHistory
   */
  async save(data) {
    return this.sequelizeDb.QueryHistory.create(data);
  }
}

module.exports = QueryHistory;
