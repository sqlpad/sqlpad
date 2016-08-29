var path = require('path');
var Datastore = require('nedb');
var fs = require('fs');
var noop = function () {};
var ConfigItem = require('../models/ConfigItem.js');
var config = require('./config.js');

/*
    Usage:

    db.js provides link to initialized nedb instance

    var db = require('db.js');
    
    // initialize databases. 
    // only necessary on first use within app
    // repeated calls do not do anything
    db.init(dbPath); 

    // reference users nedb
    db.users 

==============================================================================*/

var db = {
    dbPath: config.get('dbPath'),
    loadedDbs: []
};
module.exports = db;


/*  make a reference to our embedded database on the app object.
    When we pass the app around to various things, we'll also be passing
    the db reference.
========================================================================= */
db.addDbToApp = function (app) {
    app.set('db', db);
}

db.users = new Datastore({filename: path.join(db.dbPath, "/users.db"), autoload: true, onload: onUsersDbLoad});
db.connections = new Datastore({filename: path.join(db.dbPath, "/connections.db"), autoload: true});
db.queries = new Datastore({filename: path.join(db.dbPath, "/queries.db"), autoload: true});
db.cache = new Datastore({filename: path.join(db.dbPath, "/cache.db"), autoload: true, onload: onCacheDbLoad});
db.config = new Datastore({filename: path.join(db.dbPath, "/config.db"), autoload: true, onload: onConfigDbLoad});

// instances provides array of nedb instances
// useful if we need to apply an operation to each database instance
// (like setting compaction time)
db.instances = [
    db.users, 
    db.connections, 
    db.queries, 
    db.cache, 
    db.config
];

fs.mkdir(path.join(db.dbPath, "/cache"), noop); // if it fails it means it already exists which is fine

function onCacheDbLoad (err) {
    if (err) console.log(err);
    db.loadedDbs.push('cache');
    db.cache.ensureIndex({fieldName: 'cacheKey',  unique: true}, function (err) {
        if (err) console.log(err);
    });
}

function onUsersDbLoad (err) {
    if (err) console.log(err);
    db.loadedDbs.push('users');
    db.users.ensureIndex({fieldName: 'email', unique: true}, function (err) {
        if (err) console.log(err);
        ensureAdmin();
    });
}

function onConfigDbLoad(err) {
    if (err) console.log(err);
    db.loadedDbs.push('config');
    db.config.ensureIndex({fieldName: 'key', unique: true}, function (err) {
        if (err) console.log(err);
        addDbConfigToHelper();
    });
}

function addDbConfigToHelper() {
    // loop through items in the config nedb and add them to the config helper api
    // (it's nice to have the db.config items cached in the config helper)
    db.config.find({}).exec(function (err, dbItems) {
        if (err) {
            console.log("error getting database config items");
        }
        dbItems.forEach(function (item) {
            var configItem = ConfigItem.findOneByKey(item.key);
            if (configItem) configItem.setDbValue(item.value);
        });
    });
}

function ensureAdmin () {
    // if an admin was passed in the command line, check to see if a user exists with that email
    // if so, set the admin to true
    // if not, whitelist the email address.
    // Then write to console that the person should visit the signup url to finish registration.
    if (config.get('admin')) {
        var adminEmail = config.get('admin');
        db.users.findOne({email: adminEmail}, function (err, user) {
            if (user) {
                db.users.update({_id: user._id}, {$set: {admin: true}}, {}, function (err) {
                    if (err) {
                        console.log("ERROR: could not make " + adminEmail + " an admin.");
                    } else {
                        console.log(adminEmail + " should now have admin access.");
                    }
                });
            } else {
                var newAdmin = {
                    email: adminEmail,
                    admin: true
                };
                db.users.insert(newAdmin, function (err) {
                    if (err) {
                        console.log("\n/ERROR: could not make " + adminEmail + " an admin.");
                    } else {
                        console.log("\n" + adminEmail + " has been whitelisted with admin access.");
                        console.log("\nPlease visit http://localhost:" + app.get('port') + "/signup/ to complete registration.");
                    }
                });
            }
        });
    }
}


/*  Every so often compact the NeDB files
========================================================================= */
var tenMinutes = 1000 * 60 * 10;
for (var instance in db.instances) {
    db.instances[instance].persistence.setAutocompactionInterval(tenMinutes);
}
