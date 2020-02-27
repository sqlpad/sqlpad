function getCacheKey(connectionId) {
  return 'schemaCache:' + connectionId;
}

class SchemaInfo {
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

  /**
   * Get schemaInfo for connection id
   * @param {string} connectionId
   */
  async getSchemaInfo(connectionId) {
    const cacheKey = getCacheKey(connectionId);
    const doc = await this.nedb.cache.findOne({ cacheKey });

    if (!doc) {
      return;
    }

    let schemaInfo;
    try {
      schemaInfo =
        typeof doc.schema === 'string' ? JSON.parse(doc.schema) : doc.schema;
    } catch (error) {
      // do nothing. valid schema will be updated
    }

    return schemaInfo;
  }

  /**
   * Save schemaInfo to cache db object
   * Schema needs to be stringified as JSON
   * Column names could have dots in name (incompatible with nedb)
   * @param {string} connectionId
   * @param {object} schemaInfo
   */
  async saveSchemaInfo(connectionId, schemaInfo) {
    const cacheKey = getCacheKey(connectionId);
    if (schemaInfo && Object.keys(schemaInfo).length) {
      const schema = JSON.stringify(schemaInfo);
      const doc = {
        cacheKey,
        schema,
        modifiedDate: new Date()
      };
      return this.nedb.cache.update({ cacheKey }, doc, {
        upsert: true
      });
    }
  }
}

module.exports = SchemaInfo;
