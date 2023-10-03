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

    // Get ACL
    query.acl = await this.sequelizeDb.QueryAcl.findAll({
      where: { queryId: id },
    });
    query.acl = query.acl.map((acl) => acl.toJSON());

    // Get created by / updated by user objects
    const createdBy = await this.sequelizeDb.Users.findOne({
      attributes: ['id', 'name', 'email'],
      where: { id: query.createdBy },
    });
    const updatedBy = await this.sequelizeDb.Users.findOne({
      attributes: ['id', 'name', 'email'],
      where: { id: query.updatedBy },
    });

    query.createdByUser = {
      id: createdBy.id,
      name: createdBy.name,
      email: createdBy.email,
    };

    if (updatedBy) {
      query.updatedByUser = {
        id: updatedBy.id,
        name: createdBy.name,
        email: createdBy.email,
      };
    }

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
    return this.sequelizeDb.sequelize.transaction(async (transaction) => {
      await this.sequelizeDb.QueryAcl.destroy({
        transaction,
        where: { queryId: id },
      });
      await this.sequelizeDb.QueryTags.destroy({
        transaction,
        where: { queryId: id },
      });
      await this.sequelizeDb.Queries.destroy({
        transaction,
        where: { id },
      });
    });
  }

  /**
   * Create new query object
   * @param {object} data - query object with tags, acl
   */
  async create(data) {
    const { acl, tags, createdAt, updatedAt, ...query } = data;
    // Open transaction
    // If tags are provided, delete existing and bulk add new
    // update query
    // commit transaction
    // return updated object
    let created;
    await this.sequelizeDb.sequelize.transaction(async (transaction) => {
      created = await this.sequelizeDb.Queries.create(query, {
        transaction,
      });

      if (Array.isArray(tags)) {
        const tagData = tags
          .filter((tag) => {
            return typeof tag === 'string' && tag.trim() !== '';
          })
          .map((tag) => {
            return { queryId: created.id, tag: tag.trim() };
          });

        await this.sequelizeDb.QueryTags.bulkCreate(tagData, { transaction });
      }

      if (acl && acl.length) {
        const aclRows = acl.map((row) => {
          return {
            queryId: created.id,
            userId: row.userId,
            userEmail: row.userEmail,
            groupId: row.groupId,
            write: row.write,
          };
        });
        await this.sequelizeDb.QueryAcl.bulkCreate(aclRows, { transaction });
      }
    });

    return this.findOneById(created.id);
  }

  /**
   * Save query object
   * returns saved query object
   * @param {string} id
   * @param {object} data - query object with tags, acl
   */
  async update(id, data) {
    const { acl, tags, createdAt, updatedAt, ...query } = data;

    await this.sequelizeDb.sequelize.transaction(async (transaction) => {
      // If tags array provided sync tags
      if (Array.isArray(tags)) {
        const tagData = tags
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
      }

      // If acl array provided sync ACL entries
      if (Array.isArray(acl)) {
        await this.sequelizeDb.QueryAcl.destroy({
          transaction,
          where: { queryId: id },
        });

        const aclRows = acl.map((row) => {
          return {
            queryId: id,
            userId: row.userId,
            userEmail: row.userEmail,
            groupId: row.groupId,
            write: row.write,
          };
        });
        await this.sequelizeDb.QueryAcl.bulkCreate(aclRows, { transaction });
      }

      const update = { ...query };
      delete update.id;
      await this.sequelizeDb.Queries.update(update, {
        transaction,
        where: { id },
      });
    });

    return this.findOneById(id);
  }
}

module.exports = Queries;
