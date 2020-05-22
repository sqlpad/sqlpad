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

  /**
   * @param {String} id
   * @param {Object} data
   */
  async update(id, data) {
    let startTime;
    let stopTime;
    const { columns, rowCount, error, status } = data;

    if (status === 'started') {
      startTime = new Date();
    } else if (status === 'finished' || status === 'error') {
      stopTime = new Date();
    }

    const update = {
      startTime,
      stopTime,
      columns,
      rowCount,
      error,
      status,
    };

    await this.sequelizeDb.Statements.update(update, { where: { id } });

    return this.findOneById(id);
  }
}

module.exports = Statements;
