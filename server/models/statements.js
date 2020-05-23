const util = require('util');
const path = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp');
const writeFile = util.promisify(fs.writeFile);

class Statements {
  /**
   * @param {import('../sequelize-db')} sequelizeDb
   * @param {import('../lib/config')} config
   */
  constructor(sequelizeDb, config) {
    this.sequelizeDb = sequelizeDb;
    this.config = config;
  }

  async findOneById(id) {
    let statement = await this.sequelizeDb.Statements.findOne({
      where: { id },
    });
    if (!statement) {
      return;
    }
    return statement.toJSON();
  }

  async findAllByBatchId(batchId) {
    let items = await this.sequelizeDb.Statements.findAll({
      where: { batchId },
      order: [['sequence', 'ASC']],
    });
    items = items.map((item) => item.toJSON());
    return items;
  }

  removeById(id) {
    let notFinished = true;
    if (notFinished) {
      throw new Error('TODO remove data file');
    }
    return this.sequelizeDb.Batches.destroy({ where: { id } });
  }

  async updateStarted(id) {
    const update = {
      status: 'started',
      startTime: new Date(),
    };
    await this.sequelizeDb.Statements.update(update, { where: { id } });
    return this.findOneById(id);
  }

  async updateErrored(id, error) {
    const update = {
      status: 'error',
      stopTime: new Date(),
      error,
    };
    await this.sequelizeDb.Statements.update(update, { where: { id } });
    return this.findOneById(id);
  }

  async updateFinished(id, queryResult) {
    const dbPath = this.config.get('dbPath');
    const rowCount = queryResult.rows.length;

    let resultPath;

    // If rows returned write results csv
    if (rowCount > 0) {
      const dir = id.slice(0, 3);
      await mkdirp(path.join(dbPath, 'results', dir));
      resultPath = path.join('results', dir, `${id}.json`);
      const fullPath = path.join(dbPath, resultPath);
      const arrOfArr = queryResult.rows.map((row) => {
        return queryResult.columns.map((col) => row[col.name]);
      });
      await writeFile(fullPath, JSON.stringify(arrOfArr));
    }

    const update = {
      status: 'finished',
      stopTime: new Date(),
      rowCount,
      columns: queryResult.columns,
      resultPath,
    };

    await this.sequelizeDb.Statements.update(update, { where: { id } });
  }
}

module.exports = Statements;
