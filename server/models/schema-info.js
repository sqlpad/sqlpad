const ensureJson = require('./ensure-json');

class SchemaInfo {
  /**
   * @param {import('../sequelize-db')}
   * @param {import('../lib/config')} config
   */
  constructor(sequelizeDb, config) {
    this.sequelizeDb = sequelizeDb;
    this.config = config;
  }

  /**
   * Get schemaInfo for schema id
   * @param {string} schemaCacheId
   */
  async getSchemaInfo(schemaCacheId) {
    const doc = await this.sequelizeDb.Cache.findOne({
      where: { id: schemaCacheId },
    });

    if (!doc) {
      return;
    }

    return ensureJson(doc.data);
  }

  /**
   * Save schemaInfo to cache db object
   * @param {string} schemaCacheId
   * @param {object} schema
   */
  async saveSchemaInfo(schemaCacheId, schema) {
    const id = schemaCacheId;
    const existing = await this.sequelizeDb.Cache.findOne({ where: { id } });
    const ONE_DAY = 1000 * 60 * 60 * 24;
    const expiryDate = new Date(Date.now() + ONE_DAY);

    if (!existing) {
      return this.sequelizeDb.Cache.create({
        id,
        data: schema,
        expiryDate,
        name: 'schema cache',
      });
    } else {
      return this.sequelizeDb.Cache.update(
        { data: schema, expiryDate, name: 'schema cache' },
        { where: { id } }
      );
    }
  }
}

module.exports = SchemaInfo;
