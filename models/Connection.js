var Joi = require('joi')
var db = require('../lib/db.js')
var _ = require('lodash')

var schema = {
  _id: Joi.string().optional(), // will be auto-gen by nedb
  name: Joi.string().required(),
  driver: Joi.string().required(), // postgres, mysql, etc
  host: Joi.string().optional(),
  port: Joi.any().optional(),
  database: Joi.string().optional(),
  username: Joi.string().default('', 'Database Username'), // decrypt for presentation, encrypted for storage
  password: Joi.string().default('', 'Database Password'), // decrypt for presentation, encrypted for storage
  domain: Joi.string().optional().allow(''),
  sqlserverEncrypt: Joi.boolean().default(false, 'SQL Server Encrypt'),
  postgresSsl: Joi.boolean().default(false, 'Postgres SSL'),
  postgresCert: Joi.string().optional(),
  postgresKey: Joi.string().optional(),
  postgresCA: Joi.string().optional(),
  useSocks: Joi.boolean().default(false, 'Connect to database through SOCKS proxy'),
  socksHost: Joi.string().optional(),
  socksPort: Joi.string().optional(),
  socksUsername: Joi.string().optional(),
  socksPassword: Joi.string().optional(),
  mysqlInsecureAuth: Joi.boolean().default(false, 'Mysql Insecure Auth'),
  prestoCatalog: Joi.string().optional().allow(''),
  prestoSchema: Joi.string().optional().allow(''),
  createdDate: Joi.date().default(new Date(), 'time of creation'),
  modifiedDate: Joi.date().default(new Date(), 'time of modifcation')
}

var Connection = function Connection (data) {
  this._id = data._id
  this.name = data.name
  this.driver = data.driver
  this.host = data.host
  this.port = data.port
  this.database = data.database
  this.username = data.username
  this.password = data.password
  this.domain = data.domain // this is sql server only for now, but could apply to other dbs in future?
  this.sqlserverEncrypt = data.sqlserverEncrypt
  this.postgresSsl = data.postgresSsl
  this.postgresCert = data.postgresCert
  this.postgresKey = data.postgresKey
  this.useSocks = data.useSocks
  this.socksHost = data.socksHost
  this.socksPort = data.socksPort
  this.socksUsername = data.socksUsername
  this.socksPassword = data.socksPassword
  this.mysqlInsecureAuth = data.mysqlInsecureAuth
  this.prestoCatalog = data.prestoCatalog
  this.prestoSchema = data.prestoSchema
  this.createdDate = data.createdDate
  this.modifiedDate = data.modifiedDate
}

Connection.prototype.save = function ConnectionSave (callback) {
  var self = this
  this.modifiedDate = new Date()
    // TODO - build in auto cypher if rawUsername and rawPassword set?
  var joiResult = Joi.validate(self, schema)
  if (joiResult.error) return callback(joiResult.error)
  if (self._id) {
    db.connections.update({_id: self._id}, joiResult.value, {}, function (err) {
      if (err) return callback(err)
      Connection.findOneById(self._id, callback)
    })
  } else {
    db.connections.insert(joiResult.value, function (err, newDoc) {
      if (err) return callback(err)
      return callback(null, new Connection(newDoc))
    })
  }
}

/*  Query methods
============================================================================== */

Connection.findOneById = function ConnectionFindOneById (id, callback) {
  db.connections.findOne({_id: id}).exec(function (err, doc) {
    if (err) return callback(err)
    if (!doc) return callback()
    return callback(err, new Connection(doc))
  })
}

Connection.findAll = function ConnectionFindAll (callback) {
  db.connections.find({}).exec(function (err, docs) {
    if (err) return callback(err)
    var connections = docs.map(function (doc) {
      return new Connection(doc)
    })
    connections = _.sortBy(connections, function (c) {
      return c.name.toLowerCase()
    })
    return callback(null, connections)
  })
}

Connection.removeOneById = function ConnectionRemoveOneById (id, callback) {
  db.connections.remove({_id: id}, callback)
}

Connection._removeAll = function _removeAllConnections (callback) {
  db.connections.remove({}, {multi: true}, callback)
}

module.exports = Connection
