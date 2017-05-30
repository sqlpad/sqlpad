/*
  ConfigItem behaves a lot differently than other models

  All config item data is cached in memory.
  Config items are defined in a toml file
  Config item values come from all kinds of sources:
      - Environment variables
      - cli flags
      - saved cli flags
      - the config nedb database

  That last source it tricky because the nedb database depends on config values to load
*/
var fs = require('fs')
var path = require('path')
var toml = require('toml')
var _ = require('lodash')
var minimist = require('minimist')

// various file paths for later
var userHome = (process.platform === 'win32' ? process.env.USERPROFILE : process.env.HOME)
var savedCliFilePath = path.join(userHome, '.sqlpadrc')
var defaultDbPath = path.join(userHome, 'sqlpad/db')

// toml config item definitions
var tomlFile = fs.readFileSync(path.join(__dirname, '/../resources/config-items.toml'), {encoding: 'utf8'})
var parsedToml = toml.parse(tomlFile)
var configItemDefinitions = parsedToml.configItems

// parse command line args
var argv = minimist(process.argv.slice(2))

// if saved cli file exists, read it
var savedCli = {}
if (fs.existsSync(savedCliFilePath)) {
  savedCli = JSON.parse(fs.readFileSync(savedCliFilePath, {encoding: 'utf8'}))
}

// in-memory store of items
var configItems = []

var ConfigItem = function (data) {
  var self = this
  this.interface = data.interface // env or ui
  this.key = data.key
  this.cliFlag = data.cliFlag
  this.envVar = data.envVar
  this.default = data.default
  this.example = data.example
  this.options = data.options
  this.sensitive = data.sensitive || false
  this.description = data.description
  this.label = data.label
  this.envValue = null
  this.cliValue = null
  this.savedCliValue = null
  this.dbValue = null
  this.effectiveValue = null
  this.effectiveValueSource = null

  // assign values as appropriate based on what is available

  // special exception. if item is dbPath set default to user home
  if (this.key === 'dbPath') this.default = defaultDbPath

    // populate env value if env var present
  if (this.envVar && process.env[this.envVar]) {
    this.envValue = process.env[this.envVar]
  }

    // populate value from saved cli file
    // NOTE: there could be multiple cli flags defined
  if (this.cliFlag && Array.isArray(this.cliFlag)) {
    this.cliFlag.forEach(function (flag) {
      if (savedCli[flag] != null) {
        self.savedCliValue = savedCli[flag]
      }
    })
  } else if (this.cliFlag && savedCli[this.cliFlag] != null) {
    this.savedCliValue = savedCli[this.cliFlag]
  }

    // populate value from cli flag
    // NOTE: there could be multiple cli flags defined
  if (this.cliFlag && Array.isArray(this.cliFlag)) {
    this.cliFlag.forEach(function (flag) {
      if (argv[flag] != null) {
        self.cliValue = argv[flag]
      }
    })
  } else if (this.cliFlag && argv[this.cliFlag] != null) {
    this.cliValue = argv[this.cliFlag]
  }

    // if this config item is for the database path
    // we should resolve it to ensure it is ready for use
  if (this.key === 'dbPath') {
    if (this.envValue) this.envValue = path.resolve(this.envValue)
    if (this.cliValue) this.cliValue = path.resolve(this.cliValue)
    if (this.savedCliValue) this.savedCliValue = path.resolve(this.savedCliValue)
  }

  this.computeEffectiveValue()
}

ConfigItem.prototype.computeEffectiveValue = function () {
  if (this.cliValue != null) {
    this.effectiveValue = this.cliValue
    this.effectiveValueSource = 'cli'
  } else if (this.savedCliValue != null) {
    this.effectiveValue = this.savedCliValue
    this.effectiveValueSource = 'saved cli'
  } else if (this.envValue != null) {
    this.effectiveValue = this.envValue
    this.effectiveValueSource = 'env'
  } else if (this.dbValue != null) {
    this.effectiveValue = this.dbValue
    this.effectiveValueSource = 'db'
  } else if (this.default != null) {
    this.effectiveValue = this.default
    this.effectiveValueSource = 'default'
  }

    // It is possible that some of our boolean values are stored as text
    // for consumption convenience, those strings should be turned to actual booleans
  var valueProps = [
    'default',
    'savedCliValue',
    'cliValue',
    'envValue',
    'dbValue',
    'effectiveValue'
  ]
  valueProps.forEach(function (valueProp) {
    if (typeof this[valueProp] === 'string') {
      if (this[valueProp].toLowerCase() === 'true') {
        this[valueProp] = true
      } else if (this[valueProp].toLowerCase() === 'false') {
        this[valueProp] = false
      }
    }
  }.bind(this))
}

ConfigItem.prototype.setDbValue = function (value) {
  this.dbValue = value
  this.computeEffectiveValue()
}

// Saves a config value to the database
// Here we are throwing any errors that may come up.
// The only time this should be used is for saving values from the ui
// and the UI is built using the Config Item toml file
// If this is trying to save a value not in that file it is being misused
ConfigItem.prototype.save = function (callback) {
  var self = this
  if (this.interface !== 'ui') {
    throw new Error('Config Item ' + this.key + ' must use ui interface to be saved to db')
  }
    // get database and save the value there
  var db = require('../lib/db.js')
  db.config.findOne({key: this.key}).exec(function (err, doc) {
    if (err) return callback(err)
    if (doc) {
      doc.value = self.dbValue
      doc.modifiedDate = new Date()
      db.config.update({_id: doc._id}, doc, {}, function (err) {
        callback(err, self)
      })
    } else {
      var newConfigValue = {
        key: self.key,
        value: self.dbValue,
        createdDate: new Date(),
        modifiedDate: new Date()
      }
      db.config.insert(newConfigValue, function (err) {
        callback(err, self)
      })
    }
  })
}

/*  Loop through config item definitions
    and create config items stored in memory
============================================================================== */
configItemDefinitions.forEach(function (itemDefinition) {
  var configItem = new ConfigItem(itemDefinition)
  configItems.push(configItem)
})

/*  Query methods
============================================================================== */
ConfigItem.findOneByKey = function (key) {
  return _.find(configItems, {key: key})
}

ConfigItem.findAll = function () {
  return configItems
}

module.exports = ConfigItem
