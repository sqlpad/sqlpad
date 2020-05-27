const util = require('util');
const path = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp');
const writeFile = util.promisify(fs.writeFile);
const readFile = util.promisify(fs.readFile);
const unlink = util.promisify(fs.unlink);
const access = util.promisify(fs.access);

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

  async removeById(id) {
    const statement = this.findOneById(id);
    const { resultsPath } = statement;

    if (resultsPath) {
      const dbPath = this.config.get('dbPath');
      const fullPath = path.join(dbPath, resultsPath);

      let exists = true;
      try {
        await access(fullPath);
      } catch (error) {
        exists = false;
      }

      if (exists) {
        await unlink(fullPath);
      }
    }

    return this.sequelizeDb.Statements.destroy({ where: { id } });
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

    let resultsPath;

    // If rows returned write results csv
    if (rowCount > 0) {
      const dir = id.slice(0, 3);
      await mkdirp(path.join(dbPath, 'results', dir));
      resultsPath = path.join('results', dir, `${id}.json`);
      const fullPath = path.join(dbPath, resultsPath);
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
      resultsPath,
      incomplete: queryResult.incomplete,
    };

    await this.sequelizeDb.Statements.update(update, { where: { id } });
  }

  async getStatementResults(id) {
    const statement = await this.findOneById(id);
    if (!statement) {
      throw new Error('Statement not found');
    }
    const { resultsPath } = statement;

    // If no result path the query had no rows.
    // Return empty array
    if (!resultsPath) {
      return [];
    }

    const fullPath = path.join(this.config.get('dbPath'), resultsPath);

    let exists = true;
    try {
      await access(fullPath);
    } catch (error) {
      exists = false;
    }

    if (exists) {
      const fileData = await readFile(fullPath, 'utf8');
      return JSON.parse(fileData);
    }

    return [];
  }
}

module.exports = Statements;
