var fs = require('fs');
var path = require('path');
var config = require('./config.js');
var DB_PATH = config.get('dbPath');
var User = require('../models/User.js');
var async = require('async');
var schemaVersionFilePath = path.resolve(DB_PATH + "/schemaVersion.json"); 

// if schemaversion file does not exist
// create it and set it to version 0
if (!fs.existsSync(schemaVersionFilePath)) {
    fs.writeFileSync(schemaVersionFilePath, JSON.stringify({schemaVersion: 0}));
}

// read schemaversion file
var schemaVersion = JSON.parse(fs.readFileSync(schemaVersionFilePath, {encoding: 'utf8'}));

// migrations must increment by 1
var migrations = {
    // from now on, user.createdDate is when the user record was createdDate
    // instead of when the user signed up
    // user.signupDate should be used when user is initially signed up.
    1: function (done) {
        User.findAll(function (err, users) {
            async.eachSeries(users, function (user, callback) {
                user.signupDate = user.createdDate;
                user.save(callback);
            }, done);
        })
    }
}

function runMigrationsIfNecessary (currentVersion) {
    var nextVersion = currentVersion + 1;
    if (migrations[nextVersion]) {
        console.log("Migrating schema from %d to %d", currentVersion, nextVersion);
        migrations[nextVersion](function (err) {
            // if error log it and stop running migrations
            if (err) return console.error(err);
            // write new schemaVersion file
            fs.writeFileSync(schemaVersionFilePath, JSON.stringify({schemaVersion: nextVersion}));
            runMigrationsIfNecessary(nextVersion);
        });
    }
}

runMigrationsIfNecessary(schemaVersion.schemaVersion);