class QueryHistory {
  /**
   * @param {import('../sequelize-db')} sequelizeDb
   * @param {import('../lib/config')} config
   */
  constructor(sequelizeDb, config) {
    this.sequelizeDb = sequelizeDb;
    this.config = config;
  }

  async findByFilter(filter) {
    const rows = await this.sequelizeDb.QueryHistory.findAll({
      where: filter,
      order: [['startTime', 'DESC']],
    });
    return rows.map((row) => row.toJSON());
  }
}

module.exports = QueryHistory;
