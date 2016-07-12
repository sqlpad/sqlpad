var path = require('path');
var Datastore = require('nedb');
var fs = require('fs');
var noop = function () {};

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
    initialized: false,
    dbPath: ''
};
module.exports = db;


/*  make a reference to our embedded database on the app object.
    When we pass the app around to various things, we'll also be passing
    the db reference.
========================================================================= */
db.addDbToApp = function (app) {
    app.set('db', db);
}

db.init = function (dbPath) {

    if (db.initialized) {
        console.log("db.js already initialized. skipping");
        return;
    }
    db.initialized = true;

    db.dbPath = dbPath;

    db.users = new Datastore({filename: path.join(dbPath, "/users.db"), autoload: true, onload: onUsersDbLoad});
    db.connections = new Datastore({filename: path.join(dbPath, "/connections.db"), autoload: true});
    db.queries = new Datastore({filename: path.join(dbPath, "/queries.db"), autoload: true});
    db.cache = new Datastore({filename: path.join(dbPath, "/cache.db"), autoload: true, onload: onCacheDbLoad});
    db.config = new Datastore({filename: path.join(dbPath, "/config.db"), autoload: true, onload: onConfigDbLoad});

    // instances provides array of nedb instances
    // useful if we need to apply an operation to each database instance
    // (like setting compaction time)
    db.instances = [
        db.users, db.connections, db.queries, db.cache, db.config
    ];

    fs.mkdir(path.join(dbPath, "/cache"), noop); // if it fails it means it already exists which is fine
    
    clearExpiredCache();
    
    
    /*  Every day, compact the NeDB files. 
        This could maybe be done more often if necessary
    ========================================================================= */
    var tenMinutes = 1000 * 60 * 10;
    for (var instance in db.instances) {
        db.instances[instance].persistence.setAutocompactionInterval(tenMinutes);
    }
};



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
            var csvPath = path.join(db.dbPath, "/cache/", doc.cacheKey + ".csv");
            if (fs.existsSync(csvPath)) {
                fs.unlinkSync(csvPath);
            }
            db.cache.remove({_id: doc._id}, {});
            
        });
        setTimeout(clearExpiredCache, fiveMinutes);
    });
}




