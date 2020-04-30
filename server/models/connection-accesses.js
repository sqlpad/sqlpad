const consts = require('../lib/consts');
const { Op } = require('sequelize');

class ConnectionAccesses {
  /**
   * @param {import('../sequelize-db')} sequelizeDb
   * @param {import('../lib/config')} config
   */
  constructor(sequelizeDb, config) {
    this.sequelizeDb = sequelizeDb;
    this.config = config;
  }

  async create(data) {
    if (!data.connectionId) {
      throw new Error('connectionId required when saving connection access');
    }

    if (!data.userId) {
      throw new Error('userId required when saving connection access');
    }

    if (data.duration > 0) {
      data.expiryDate = new Date(new Date().getTime() + data.duration * 1000);
    } else {
      data.expiryDate = new Date().setFullYear(2099);
    }

    await this.sequelizeDb.ConnectionAccesses.create({
      connectionId: data.connectionId,
      connectionName: data.connectionName,
      userId: data.userId,
      userEmail: data.userEmail,
      duration: data.duration,
      expiryDate: data.expiryDate,
    });

    return this.findOneActiveByConnectionIdAndUserId(
      data.connectionId,
      data.userId
    );
  }

  async expire(id) {
    const connectionAccess = await this.sequelizeDb.ConnectionAccesses.findOne({
      where: { id },
    });
    if (!connectionAccess) {
      throw new Error('Connection access not found');
    }
    await this.sequelizeDb.ConnectionAccesses.update(
      { expiryDate: new Date() },
      { where: { id } }
    );
    return this.findOneById(id);
  }

  findOneById(id) {
    return this.sequelizeDb.ConnectionAccesses.findOne({ where: { id } });
  }

  findOneActiveByConnectionIdAndUserId(connectionId, userId) {
    const where = {
      [Op.and]: {
        [Op.or]: [
          {
            connectionId: {
              [Op.in]: [connectionId, consts.EVERY_CONNECTION_ID],
            },
            userId,
          },
          {
            connectionId,
            userId: { [Op.in]: [connectionId, consts.EVERYONE_ID] },
          },
          {
            connectionId: consts.EVERY_CONNECTION_ID,
            userId: consts.EVERYONE_ID,
          },
        ],
      },
      expiryDate: { [Op.gt]: new Date() },
    };

    return this.sequelizeDb.ConnectionAccesses.findOne({ where });
  }

  findAllActiveByConnectionId(connectionId) {
    const where = {
      connectionId: { [Op.in]: [connectionId, consts.EVERY_CONNECTION_ID] },
      expiryDate: { [Op.gt]: new Date() },
    };

    return this.sequelizeDb.ConnectionAccesses.findOne({ where });
  }

  findAllByConnectionId(connectionId) {
    const where = {
      connectionId: { [Op.in]: [connectionId, consts.EVERY_CONNECTION_ID] },
    };
    return this.sequelizeDb.ConnectionAccesses.findAll({ where });
  }

  findAllActive() {
    return this.sequelizeDb.ConnectionAccesses.findAll({
      where: { expiryDate: { [Op.gt]: new Date() } },
      order: [['expiryDate', 'DESC']],
    });
  }

  findAll() {
    return this.sequelizeDb.ConnectionAccesses.findAll({
      order: [['expiryDate', 'DESC']],
    });
  }

  removeById(id) {
    return this.sequelizeDb.ConnectionAccesses.destroy({ where: { id } });
  }
}

module.exports = ConnectionAccesses;
