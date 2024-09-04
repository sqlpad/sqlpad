import sqlLimiter from 'sql-limiter';
import _ from 'lodash';
import ensureJson from './ensure-json.js';

class Batches {
  /**
   * @param {import('../sequelize-db')} sequelizeDb
   * @param {import('../lib/config')} config
   */
  constructor(sequelizeDb, config) {
    this.sequelizeDb = sequelizeDb;
    this.config = config;
  }

  async findOneById(id) {
    let batch = await this.sequelizeDb.Batches.findOne({ where: { id } });
    if (!batch) {
      return;
    }
    batch = batch.toJSON();
    batch.chart = ensureJson(batch.chart);

    const statements = await this.sequelizeDb.Statements.findAll({
      where: { batchId: id },
      order: [['sequence', 'ASC']],
    });
    batch.statements = statements.map((s) => {
      s = s.toJSON();
      s.columns = ensureJson(s.columns);
      s.error = ensureJson(s.error);
      return s;
    });

    return batch;
  }

  async findAllForUser(user) {
    let items = await this.sequelizeDb.Batches.findAll({
      where: { userId: user.id },
    });
    items = items.map((item) => item.toJSON());
    return items;
  }

  /**
   * Get all batches and more for user and query id
   * @param {object} user
   * @param {string} [queryId]
   * @param {boolean} [includeStatements]
   * @param {number} [limit]
   */
  async findAllForUserQuery(
    user,
    queryId = null,
    includeStatements = false,
    limit = 40
  ) {
    let batches = await this.sequelizeDb.Batches.findAll({
      where: { userId: user.id, queryId },
      limit,
      order: [['createdAt', 'DESC']],
    });
    batches = batches.map((item) => item.toJSON());

    if (includeStatements) {
      const batchIds = batches.map((batch) => batch.id);
      let statements = await this.sequelizeDb.Statements.findAll({
        where: { batchId: batchIds },
      });
      statements = statements.map((statement) => statement.toJSON());
      const statementsByBatchId = _.groupBy(statements, 'batchId');
      batches.forEach((batch) => {
        batch.statements = statementsByBatchId[batch.id];
        if (batch.statements) {
          _.sortBy(batch.statements, ['sequence']);
        }
      });
    }

    // Results are in desc order, but we'll return them in ascending
    batches = _.sortBy(batches, ['createdAt']);

    return batches;
  }

  /**
   * Create a new batch (and statements)
   * selectedText is parsed out into statements
   * @param {object} batch
   */
  async create(batch) {
    let createdBatch;

    const queryText = batch.selectedText || batch.batchText;

    // sqlLimiter could fail at parsing the SQL text
    // If this happens the error is captured and reported as if it were a query error

    let error;
    let statementTexts = [queryText];
    try {
      statementTexts = sqlLimiter
        .getStatements(queryText)
        .map((s) => sqlLimiter.removeTerminator(s))
        .filter((s) => s && s.trim() !== '');
    } catch (e) {
      error = e;
    }

    await this.sequelizeDb.sequelize.transaction(async (transaction) => {
      const createData = { ...batch };
      if (error) {
        createData.status = 'error';
      }
      createdBatch = await this.sequelizeDb.Batches.create(createData, {
        transaction,
      });

      const statements = statementTexts.map((statementText, i) => {
        return {
          batchId: createdBatch.id,
          sequence: i + 1,
          statementText,
          status: error ? 'error' : 'queued',
          error: error && { title: error.message },
        };
      });

      await this.sequelizeDb.Statements.bulkCreate(statements, { transaction });
    });

    return this.findOneById(createdBatch.id);
  }

  /**
   * Update batch object
   * Statements are not updated through this method
   * @param {string} id
   * @param {data} data
   */
  async update(id, data) {
    await this.sequelizeDb.Batches.update(data, { where: { id } });
    return this.findOneById(id);
  }
}

export default Batches;
