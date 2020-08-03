/* eslint-disable no-await-in-loop */
const util = require('util');
const path = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp');
const { promisify } = require('util');
const LRU = require('lru-cache');
const redis = require('redis');
const { Op } = require('sequelize');
const ensureJson = require('./ensure-json');
const writeFile = util.promisify(fs.writeFile);
const readFile = util.promisify(fs.readFile);
const unlink = util.promisify(fs.unlink);
const access = util.promisify(fs.access);

function redisDbKey(id) {
  return `statement-result/${id}`;
}

class Statements {
  /**
   * @param {import('../sequelize-db')} sequelizeDb
   * @param {import('../lib/config')} config
   */
  constructor(sequelizeDb, config) {
    this.sequelizeDb = sequelizeDb;
    this.config = config;
    this.queryResultStore = config.get('queryResultStore');

    if (this.queryResultStore === 'redis') {
      const client = redis.createClient(config.get('redisUri'));
      this.redisClient = client;
      this.redisGetAsync = promisify(client.get).bind(client);
      this.redisSetexAsync = promisify(client.setex).bind(client);
      this.redisDelAsync = promisify(client.del).bind(client);
    }

    if (this.queryResultStore === 'memory') {
      this.memoryCache = new LRU({ max: 1000, maxAge: 1000 * 60 * 60 });
    }
  }

  isFileStore() {
    return this.queryResultStore === 'file';
  }

  isDatabaseStore() {
    return this.queryResultStore === 'database';
  }

  isRedisStore() {
    return this.queryResultStore === 'redis';
  }

  isMemoryStore() {
    return this.queryResultStore === 'memory';
  }

  async findOneById(id) {
    let statement = await this.sequelizeDb.Statements.findOne({
      where: { id },
    });
    if (!statement) {
      return;
    }
    statement.columns = ensureJson(statement.columns);
    statement.error = ensureJson(statement.error);
    return statement.toJSON();
  }

  async findAllByBatchId(batchId) {
    let items = await this.sequelizeDb.Statements.findAll({
      where: { batchId },
      order: [['sequence', 'ASC']],
    });
    items = items.map((item) => {
      const i = item.toJSON();
      i.columns = ensureJson(i.columns);
      i.error = ensureJson(i.error);
      return i;
    });
    return items;
  }

  /**
   * Remove statement by id
   * @param {string} id - statement id
   */
  async removeById(id) {
    const statement = await this.findOneById(id);
    const { resultsPath } = statement;

    if (this.isFileStore() && resultsPath) {
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

    if (this.isRedisStore()) {
      await this.redisDelAsync(redisDbKey(id));
    }

    if (this.isMemoryStore()) {
      this.memoryCache.del(id);
    }

    if (this.isDatabaseStore()) {
      await this.sequelizeDb.Cache.destroy({ where: { id: redisDbKey(id) } });
    }

    return this.sequelizeDb.Statements.destroy({ where: { id } });
  }

  async updateStarted(id, startTime) {
    const update = {
      status: 'started',
      startTime,
    };
    await this.sequelizeDb.Statements.update(update, { where: { id } });
    return this.findOneById(id);
  }

  async updateErrored(id, error, stopTime, durationMs) {
    const update = {
      status: 'error',
      stopTime,
      durationMs,
      error,
    };
    await this.sequelizeDb.Statements.update(update, { where: { id } });
    return this.findOneById(id);
  }

  async updateFinished(id, queryResult, stopTime, durationMs) {
    const { config } = this;
    const dbPath = config.get('dbPath');
    const rowCount = queryResult.rows.length;

    let resultsPath;

    // If rows returned write results csv
    if (rowCount > 0) {
      const arrOfArr = queryResult.rows.map((row) => {
        return queryResult.columns.map((col) => row[col.name]);
      });

      if (this.isFileStore()) {
        const dir = id.slice(0, 3);
        await mkdirp(path.join(dbPath, 'results', dir));
        resultsPath = path.join('results', dir, `${id}.json`);
        const fullPath = path.join(dbPath, resultsPath);
        await writeFile(fullPath, JSON.stringify(arrOfArr));
      }

      if (this.isRedisStore()) {
        // Redis results can be removed by redis itself
        // In the event seconds does not exist or is zero, default to 1 hour
        let seconds =
          parseInt(config.get('queryHistoryRetentionTimeInDays'), 10) * 86400;
        if (!seconds || seconds <= 0) {
          seconds = 60 * 60;
        }
        await this.redisSetexAsync(
          redisDbKey(id),
          seconds,
          JSON.stringify(arrOfArr)
        );
      }

      if (this.isDatabaseStore()) {
        const ONE_DAY = 1000 * 60 * 60 * 24;
        const daysMs =
          parseInt(config.get('queryHistoryRetentionTimeInDays'), 10) * ONE_DAY;
        const expiryDate = new Date(Date.now() + daysMs);
        await this.sequelizeDb.Cache.create({
          id: redisDbKey(id),
          data: arrOfArr,
          expiryDate,
          name: 'statement results',
        });
      }

      if (this.isMemoryStore()) {
        this.memoryCache.set(id, arrOfArr);
      }
    }

    const update = {
      status: 'finished',
      stopTime,
      durationMs,
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

    const { config } = this;

    if (this.isFileStore()) {
      const { resultsPath } = statement;

      // If no result path the query had no rows.
      // Return empty array
      if (!resultsPath) {
        return [];
      }

      const fullPath = path.join(config.get('dbPath'), resultsPath);

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

    if (this.isRedisStore()) {
      const json = await this.redisGetAsync(redisDbKey(statement.id));
      if (json) {
        const parsed = JSON.parse(json);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
      return [];
    }

    if (this.isDatabaseStore()) {
      const doc = await this.sequelizeDb.Cache.findOne({
        where: { id: redisDbKey(statement.id) },
      });
      if (doc) {
        const result = ensureJson(doc.data);
        if (Array.isArray(result)) {
          return result;
        }
      }
      return [];
    }

    if (this.isMemoryStore()) {
      const result = this.memoryCache.get(statement.id);
      if (Array.isArray(result)) {
        return result;
      }
      return [];
    }
  }

  async removeOldEntries() {
    const days =
      this.config.get('queryHistoryRetentionTimeInDays') * 86400 * 1000;
    const retentionPeriodStartTime = new Date(new Date().getTime() - days);

    const statements = await this.sequelizeDb.Statements.findAll({
      where: { createdAt: { [Op.lt]: retentionPeriodStartTime } },
      attributes: ['id'],
      raw: true,
    });

    for (const statement of statements) {
      await this.removeById(statement.id);
    }
  }
}

module.exports = Statements;
