const Joi = require('@hapi/joi');
const consts = require('../lib/consts');

const schema = Joi.object({
  _id: Joi.string().optional(), // will be auto-gen by nedb
  connectionId: Joi.string().required(),
  connectionName: Joi.string().required(),
  userId: Joi.string().required(),
  userEmail: Joi.string().required(),
  duration: Joi.number()
    .integer()
    .min(900)
    .max(86400)
    .default(0),
  expiryDate: Joi.date().default(Date.now),
  createdDate: Joi.date().default(Date.now),
  modifiedDate: Joi.date().default(Date.now)
});

class ConnectionAccesses {
  /**
   * @param {*} nedb
   * @param {import('../lib/config')} config
   */
  constructor(nedb, config) {
    this.nedb = nedb;
    this.config = config;
  }

  async save(data) {
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

    const joiResult = schema.validate(data);
    if (joiResult.error) {
      return Promise.reject(joiResult.error);
    }

    await this.nedb.connectionAccesses.update(
      {
        connectionId: data.connectionId,
        connectionName: data.connectionName,
        userId: data.userId,
        userEmail: data.userEmail,
        duration: data.duration,
        expiryDate: data.expiryDate
      },
      joiResult.value,
      {
        upsert: true
      }
    );
    return this.findOneActiveByConnectionIdAndUserId(
      data.connectionId,
      data.userId
    );
  }

  async expire(id) {
    const connectionAccess = await this.nedb.connectionAccesses.findOne({
      _id: id
    });
    if (!connectionAccess) {
      throw new Error('Connection access not found');
    }

    connectionAccess.expiryDate = new Date();
    connectionAccess.modifiedDate = new Date();

    await this.nedb.connectionAccesses.update({ _id: id }, connectionAccess);
    return this.findOneById(id);
  }

  findOneById(id) {
    return this.nedb.connectionAccesses.findOne({ _id: id });
  }

  findOneActiveByConnectionIdAndUserId(connectionId, userId) {
    return this.nedb.connectionAccesses.findOne({
      $and: [
        {
          $or: [
            {
              connectionId: { $in: [connectionId, consts.EVERY_CONNECTION_ID] },
              userId
            },
            {
              connectionId,
              userId: { $in: [connectionId, consts.EVERYONE_ID] }
            },
            {
              connectionId: consts.EVERY_CONNECTION_ID,
              userId: consts.EVERYONE_ID
            }
          ],
          expiryDate: { $gt: new Date() }
        }
      ]
    });
  }

  findAllActiveByConnectionId(connectionId) {
    return this.nedb.connectionAccesses.findOne({
      connectionId: { $in: [connectionId, consts.EVERY_CONNECTION_ID] },
      expiryDate: { $gt: new Date() }
    });
  }

  findAllByConnectionId(connectionId) {
    return this.nedb.connectionAccesses.findAll({
      connectionId: { $in: [connectionId, consts.EVERY_CONNECTION_ID] }
    });
  }

  findAllActive() {
    return this.nedb.connectionAccesses
      .cfind({ expiryDate: { $gt: new Date() } })
      .sort({ expiryDate: -1 })
      .exec();
  }

  findAll() {
    return this.nedb.connectionAccesses
      .cfind({}, {})
      .sort({ expiryDate: -1 })
      .exec();
  }

  removeById(id) {
    return this.nedb.connectionAccesses.remove({ _id: id });
  }
}

module.exports = ConnectionAccesses;
