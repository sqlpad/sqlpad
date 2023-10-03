const { QueryTypes } = require('sequelize');

class Tags {
  /**
   * @param {import('../sequelize-db')} sequelizeDb
   * @param {import('../lib/config')} config
   */
  constructor(sequelizeDb, config) {
    this.sequelizeDb = sequelizeDb;
    this.config = config;
  }

  async findDistinctTags() {
    const rows = await this.sequelizeDb.sequelize.query(
      'SELECT DISTINCT tag FROM query_tags ORDER BY tag',
      { type: QueryTypes.SELECT }
    );

    return rows.map((row) => row.tag);
  }
}

module.exports = Tags;
