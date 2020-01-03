const Joi = require('@hapi/joi');
const db = require('../lib/db.js');
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

async function save(data) {
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

  await db.connectionAccesses.update(
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
  return findOneActiveByConnectionIdAndUserId(data.connectionId, data.userId);
}

async function expire(id) {
  const connectionAccess = await db.connectionAccesses.findOne({ _id: id });
  if (!connectionAccess) {
    throw new Error('Connection access not found');
  }

  connectionAccess.expiryDate = new Date();
  connectionAccess.modifiedDate = new Date();

  await db.connectionAccesses.update({ _id: id }, connectionAccess);
  return findOneById(id);
}

function findOneById(id) {
  return db.connectionAccesses.findOne({ _id: id });
}

function findOneActiveByConnectionIdAndUserId(connectionId, userId) {
  return db.connectionAccesses.findOne({
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

function findAllActiveByConnectionId(connectionId) {
  return db.connectionAccesses.findOne({
    connectionId: { $in: [connectionId, consts.EVERY_CONNECTION_ID] },
    expiryDate: { $gt: new Date() }
  });
}

function findAllByConnectionId(connectionId) {
  return db.connectionAccesses.findAll({
    connectionId: { $in: [connectionId, consts.EVERY_CONNECTION_ID] }
  });
}

function findAllActive() {
  return db.connectionAccesses
    .cfind({ expiryDate: { $gt: new Date() } })
    .sort({ expiryDate: -1 })
    .exec();
}

function findAll() {
  return db.connectionAccesses
    .cfind({}, {})
    .sort({ expiryDate: -1 })
    .exec();
}

function removeById(id) {
  return db.connectionAccesses.remove({ _id: id });
}

module.exports = {
  findOneById,
  findOneActiveByConnectionIdAndUserId,
  findAllActiveByConnectionId,
  findAllByConnectionId,
  findAllActive,
  findAll,
  removeById,
  expire,
  save
};
