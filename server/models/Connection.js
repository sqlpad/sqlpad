const Joi = require('joi')
const db = require('../lib/db.js')
const _ = require('lodash')

const schema = {
  _id: Joi.string().optional(), // will be auto-gen by nedb
  name: Joi.string().required(),
  driver: Joi.string().required(), // postgres, mysql, etc
  host: Joi.string().optional(),
  port: Joi.any().optional(),
  database: Joi.string()
    .optional()
    .allow(''),
  username: Joi.string().default('', 'Database Username'), // decrypt for presentation, encrypted for storage
  password: Joi.string().default('', 'Database Password'), // decrypt for presentation, encrypted for storage
  // this is sql server only for now, but could apply to other dbs in future?
  domain: Joi.string()
    .optional()
    .allow(''),
  sqlserverEncrypt: Joi.boolean().default(false, 'SQL Server Encrypt'),
  postgresSsl: Joi.boolean().default(false, 'Postgres SSL'),
  postgresCert: Joi.string().optional(),
  postgresKey: Joi.string().optional(),
  postgresCA: Joi.string().optional(),
  useSocks: Joi.boolean().default(
    false,
    'Connect to database through SOCKS proxy'
  ),
  socksHost: Joi.string().optional(),
  socksPort: Joi.string().optional(),
  socksUsername: Joi.string().optional(),
  socksPassword: Joi.string().optional(),
  mysqlInsecureAuth: Joi.boolean().default(false, 'Mysql Insecure Auth'),
  prestoCatalog: Joi.string()
    .optional()
    .allow(''),
  prestoSchema: Joi.string()
    .optional()
    .allow(''),
  hanaSchema: Joi.string()
    .optional()
    .allow(''),
  hanaport: Joi.string()
    .optional()
    .allow('')
    .default('', '39015'),
  hanadatabase: Joi.string()
    .optional()
    .allow(''),
  createdDate: Joi.date().default(new Date(), 'time of creation'),
  modifiedDate: Joi.date().default(new Date(), 'time of modifcation')
}

const Connection = function Connection(data) {
  Object.assign(this, data)
}

Connection.prototype.save = function save() {
  const self = this
  this.modifiedDate = new Date()
  // TODO - build in auto cypher if rawUsername and rawPassword set?
  const joiResult = Joi.validate(self, schema)
  if (joiResult.error) {
    return Promise.reject(joiResult.error)
  }
  if (self._id) {
    return db.connections
      .update({ _id: self._id }, joiResult.value, {})
      .then(() => Connection.findOneById(self._id))
  }
  return db.connections.insert(joiResult.value).then(doc => new Connection(doc))
}

/*  Query methods
============================================================================== */
Connection.findOneById = id =>
  db.connections.findOne({ _id: id }).then(doc => new Connection(doc))

Connection.findAll = () =>
  db.connections.find({}).then(docs => {
    const connections = docs.map(doc => new Connection(doc))
    return _.sortBy(connections, c => c.name.toLowerCase())
  })

Connection.removeOneById = id => db.connections.remove({ _id: id })

module.exports = Connection
