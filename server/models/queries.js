const _ = require('lodash');
const ensureJson = require('./ensure-json');
/*
"chart": {
    "chartType": "line",
    "fields": {
        "x": "created_month",
        "y": "package_count",
        "split": "keyword",
        "xFacet": "",
        "yFacet": "keyword",
        "trendline": "true"
    }
}
*/

class Queries {
  /**
   * @param {import('../sequelize-db')} sequelizeDb
   * @param {import('../lib/config')} config
   */
  constructor(sequelizeDb, config) {
    this.sequelizeDb = sequelizeDb;
    this.config = config;
  }

  async findOneById(id) {
    let query = await this.sequelizeDb.Queries.findOne({ where: { id } });
    if (!query) {
      return;
    }
    query = query.toJSON();
    query.chart = ensureJson(query.chart);
    const tags = await this.sequelizeDb.QueryTags.findAll({
      attributes: ['tag'],
      where: { queryId: id },
    });

    query.tags = tags.map((tagRow) => {
      return tagRow.tag;
    });

    return query;
  }

  async findAll() {
    let queries = await this.sequelizeDb.Queries.findAll({});
    queries = queries.map((query) => query.toJSON());

    // This is not efficient, but necessary until pagination is in
    // Get *all* query tags. group by queryId, then iterate and merge into queries
    // Sequelize include not used here because it is not efficient SQL
    let queryTags = await this.sequelizeDb.QueryTags.findAll({
      attributes: ['queryId', 'tag'],
    });
    queryTags = queryTags.map((qt) => qt.toJSON());
    const tagsByQuery = _.groupBy(queryTags, 'queryId');

    queries = queries.map((query) => {
      const queryTags = tagsByQuery[query.id];
      if (queryTags) {
        query.tags = queryTags.map((qt) => qt.tag);
      }
      query.chart = ensureJson(query.chart);
      return query;
    });
    return queries;
  }

  removeById(id) {
    return this.sequelizeDb.Queries.destroy({ where: { id } });
  }

  /**
   * Create new query object
   * @param {object} query
   */
  async create(query) {
    // Open transaction
    // If tags are provided, delete existing and bulk add new
    // update query
    // commit transaction
    // return updated object
    let created;
    await this.sequelizeDb.sequelize.transaction(async (transaction) => {
      const { createdAt, updatedAt, tags, ...data } = query;
      created = await this.sequelizeDb.Queries.create(data, {
        transaction,
      });

      if (Array.isArray(query.tags)) {
        const tagData = query.tags
          .filter((tag) => {
            return typeof tag === 'string' && tag.trim() !== '';
          })
          .map((tag) => {
            return { queryId: created.id, tag: tag.trim() };
          });

        await this.sequelizeDb.QueryTags.bulkCreate(tagData, { transaction });
      }
    });

    return this.findOneById(created.id);
  }

  /**
   * Save query object
   * returns saved query object
   * @param {string} id
   * @param {object} query
   */
  async update(id, query) {
    // Open transaction
    // If tags are provided, delete existing and bulk add new
    // update query
    // commit transaction
    // return updated object
    await this.sequelizeDb.sequelize.transaction(async (transaction) => {
      if (Array.isArray(query.tags)) {
        const tagData = query.tags
          .filter((tag) => {
            return typeof tag === 'string' && tag.trim() !== '';
          })
          .map((tag) => {
            return { queryId: id, tag: tag.trim() };
          });
        await this.sequelizeDb.QueryTags.destroy({
          transaction,
          where: { queryId: id },
        });
        await this.sequelizeDb.QueryTags.bulkCreate(tagData, { transaction });
        const update = { ...query };
        delete update.id;
        delete update.createdAt;
        delete update.updatedAt;
        delete update.tags;
        await this.sequelizeDb.Queries.update(update, {
          transaction,
          where: { id },
        });
      }
    });

    return this.findOneById(id);
  }
}

module.exports = Queries;
