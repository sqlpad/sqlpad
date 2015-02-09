var path = require('path');
var Datastore = require('nedb');
var fs = require('fs');
var noop = function () {};

module.exports = function (app) {
    
    var dbPath = app.get('dbPath');
    var db = {};
    db.users = new Datastore({filename: path.join(dbPath, "/users.db"), autoload: true, onload: onUsersDbLoad});
    db.connections = new Datastore({filename: path.join(dbPath, "/connections.db"), autoload: true});
    db.queries = new Datastore({filename: path.join(dbPath, "/queries.db"), autoload: true});
    db.cache = new Datastore({filename: path.join(dbPath, "/cache.db"), autoload: true, onload: onCacheDbLoad});
    db.config = new Datastore({filename: path.join(dbPath, "/config.db"), autoload: true, onload: onConfigDbLoad});

    fs.mkdir(path.join(dbPath, "/cache"), noop); // if it fails it means it already exists which is fine
    
    function onCacheDbLoad (err) {
        if (err) console.log(err);
        db.cache.ensureIndex({fieldName: 'cacheKey',  unique: true}, function (err) {
            if (err) console.log(err);
        });
    }
    
    function onUsersDbLoad (err) {
        if (err) console.log(err);
        db.users.ensureIndex({fieldName: 'email', unique: true}, function (err) {
           if (err) console.log(err);
        });
        // if an admin was passed in the command line, check to see if a user exists with that email
        // if so, set the admin to true
        // if not, whitelist the email address.
        // Then write to console that the person should visit the signup url to finish registration.
        if (app.get('admin')) {
            var adminEmail = app.get('admin');
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

    function onConfigDbLoad(err) {
        if (err) console.log(err);
        db.config.ensureIndex({fieldName: 'key', unique: true}, function (err) {
            if (err) console.log(err);
        });
    }


    /*  Every x minutes, we need to check the cache db for expired files.
        These expired files likely won't ever be referenced again.
        These files should be removed from disk.
    ========================================================================= */
    var fiveMinutes = 1000 * 60 * 5;
    function clearExpiredCache () {
        var now = new Date();
        db.cache.find({expiration: {$lt: now}}, function (err, docs) {
            docs.forEach(function(doc) {
                var csvPath = path.join(app.get('dbPath'), "/cache/", doc.cacheKey + ".csv");
                if (fs.existsSync(csvPath)) {
                    fs.unlinkSync(csvPath);
                }
                db.cache.remove({_id: doc._id}, {});
                
            });
            setTimeout(clearExpiredCache, fiveMinutes);
        });
    }
    clearExpiredCache();
    
    
    /*  Every day, compact the NeDB files. 
        This could maybe be done more often if necessary
    ========================================================================= */
    var oneDay = 24 * 60 * 60 * 1000;
    for (var collection in db) {
        db[collection].persistence.setAutocompactionInterval(oneDay);
    }
    
    
    /*  make a reference to our embedded database on the app object.
        When we pass the app around to various things, we'll also be passing
        the db reference.
    ========================================================================= */
    app.set('db', db);
    
};