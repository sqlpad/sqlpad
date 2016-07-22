var path = require('path');
var fs = require('fs');
var rc = require('rc');
var _ = require('lodash');
var minimist = require('minimist');
var packageJson = require('../package.json');
var userHome = (process.platform === "win32" ? process.env.USERPROFILE : process.env.HOME );
var savedCliFilePath = path.join(userHome, '.sqlpadrc');
var defaultDbPath = path.join(userHome, "sqlpad/db");
var configItems = require('./config-items.js');

var configItemsByKey = _.keyBy(configItems, 'key');

var configValues = {};
var configSetBy = {};

var config = {
    set: function (key, value, setBy) {
        // the key must be defined in config-items.toml
        if (!configItemsByKey[key]) throw new Error("key must be defined in config-items.toml")

        // some values might be strings of boolean values
        // for consumption convenience, those strings should be turned to actual booleans
        if (typeof value === "string") {
            if (value.toLowerCase() === "true") {
                value = true;
            } else if (value.toLowerCase() === "false") {
                value = false;
            }
        }
        configValues[key] = value;
        if (setBy) configSetBy[key] = setBy;
    },
    get: function (key) {
        // the key must be defined in config-items.toml
        if (!configItemsByKey[key]) throw new Error("key must be defined in config-items.toml")
        
        return configValues[key];
    },
    getAllValues: function () {
        return _.clone(configValues);
    },
    getAllSetBy: function () {
        return _.clone(configSetBy);
    },
    syncConfigToApp: function (app) {
        // loop through config values and set app values to same
        for (var key in configValues) {
            app.set(key, configValues[key]);
        }

        // some special exeptions...
        if (config.get('debug')) app.set('dev', true);
    }
}
module.exports = config;

// init config
var argv = minimist(process.argv.slice(2));

// if saved cli file exists, read it
var savedCli = {};
if (fs.existsSync(savedCliFilePath)) {
    savedCli = JSON.parse(fs.readFileSync(savedCliFilePath, {encoding: 'utf8'}));
}

configItems.forEach(function(item) {
    // first load default from toml doc
    config.set(item.key, item.default, "default");

    // special exception. if item is dbPath set default to user home
    if (item.key === "dbPath") {
        config.set("dbPath", defaultDbPath);
    }

    // if envVar is specified, 
    // check to see if value is set via environment
    if (item.envVar && process.env[item.envVar]) {
        config.set(item.key, process.env[item.envVar], "env");
    }

    // populate value from saved cli file
    if (item.cliFlag && Array.isArray(item.cliFlag)) {
        item.cliFlag.forEach(function(flag) {
            if (savedCli[flag]) {
                config.set(item.key, savedCli[flag], "savedCli");
            }
        });
    } else if (item.cliFlag && savedCli[item.cliFlag]) {
        config.set(item.key, savedCli[item.cliFlag], "cli");
    }

    // populate value from cli flags. 
    // there might be multiple cli flags accepted for an item. 
    // last flag set wins
    if (item.cliFlag && Array.isArray(item.cliFlag)) {
        item.cliFlag.forEach(function(flag) {
            if (argv[flag]) {
                config.set(item.key, argv[flag], "cli");
            }
        });
    } else if (item.cliFlag && argv[item.cliFlag]) {
        config.set(item.key, argv[item.cliFlag], "cli");
    }
});

// resolve dbPath in case a relative path was sent in
var resolvedDbPath = path.resolve(config.get("dbPath"));
config.set("dbPath", resolvedDbPath);

// Ensure that NODE_ENV matches whatever env is set to in case passed in by cli
// NODE_ENV can impact the way express behaves
process.env.NODE_ENV = config.get("env");

// if debug is set, set environment to development
if (config.get("debug")) {
    console.log("debug enabled. Setting NODE_ENV to development");
    process.env.NODE_ENV = "development";
}

if (argv.v || argv.version) {
    console.log("SqlPad version " + packageJson.version);
    process.exit();
}

// if --save was passed in via cli, we should save the cli args
// this file is a simple key/value object where key is the config item key
if (argv.save) {
    console.log("Saving your configuration.");
    console.log("Next time just run 'sqlpad' and this config will be loaded.");
    fs.writeFileSync(savedCliFilePath, JSON.stringify(argv, null, 2));
}

// if --forget was passed in via cli we should remove the saved cli args file
if (argv.forget) {
    if (fs.existsSync(savedCliFilePath)) {
        fs.unlinkSync(savedCliFilePath);
        console.log("Previous configuration removed.");
    } else {
        console.log("No previous configuration saved. Maybe it was a different user?");
    }
    console.log("Now exiting...");
    process.exit();
}

if (argv.h || argv.help) {
    var helpText = fs.readFileSync(__dirname + "/help.txt", {encoding: 'utf8'});
    console.log(helpText);
    process.exit();
}