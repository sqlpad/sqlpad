#!/usr/bin/env node

var express = require('express');
var http = require('http');
var path = require('path');
var bcrypt = require('bcrypt-nodejs'); //https://www.npmjs.org/package/bcrypt-nodejs (the native one is icky for windows)
var Datastore = require('nedb');
var crypto = require('crypto');
var uaParser = require('ua-parser');
var _ = require('lodash');
var argv = require('yargs').argv;
var runQuery = require('./lib/run-query.js');
var noop = function () {};


var config = {
    passphrase: "At least the sensitive bits won't be plain text?",
    dbPath: path.join(__dirname, "/db"), // db folder within global install directory
    port: 80
};

/*  CLI Stuff
============================================================================= */
if (argv.h || argv.help) {
    var helpText = "\n\n" 
                 + "SQUEEGEE HELP: \n"
                 + " \n"
                 + "USAGE: squeegee [options]\n"
                 + " \n"
                 + "OPTIONS: \n"
                 + " \n"
                 + "  --passphrase [phrase]  Set passphrase for modest encryption  (recommended)\n"
                 + "  --db [path]            Set database directory                (optional)\n"
                 + "  --admin [email]        Whitelist an administrator email      (req. 1st run)\n"
                 + "  --port [port]          Set port to run on. Default is 80     (optional)\n"
                 + "  \n"
                 + "EXAMPLES:  \n"
                 + "  \n"
                 + "  First Run: whitelist email address. Set encryption passphrase. \n"
                 + "  Leave port and db path at default. \n"
                 + "  \n"
                 + "      squeegee --admin me@mycompany.com --passphrase s3cr3t-phr@se \n"
                 + "  \n"
                 + "  Future runs: just set encryption passphrase\n"
                 + "  \n"
                 + "      squeegee --passphrase s3cr3t-phr@se \n"
                 + "  \n"
                 + "  To set db folder, either use a relative path to current location...\n"
                 + "  \n"
                 + "      squeegee --db ./db/folder/ \n"
                 + "  \n"
                 + "  ... or use an exact path\n"
                 + "  \n"
                 + "      squeegee --db c:\\squeegeedb \n"
                 + "  \n";
                 
    console.log(helpText);
    process.exit();
}

if (argv.passphrase) {
    config.passphrase = argv.passphrase;
}

if (argv.db) {
    config.dbPath = path.resolve(argv.db);
}

if (argv.port) {
    config.port = argv.port;
}



/*  Configuration, Settings, and Misc Variables
============================================================================= */
var algorithm = 'aes256';
function cipher (text) {
    var myCipher = crypto.createCipher(algorithm, config.passphrase);
    return myCipher.update(text, 'utf8', 'hex') + myCipher.final('hex');
}
function decipher (gibberish) {
    var returnValue = "";
    try {
        var myDecipher = crypto.createDecipher(algorithm, config.passphrase);
        returnValue = myDecipher.update(gibberish, 'hex', 'utf8') + myDecipher.final('utf8');    
    }
    finally {
        return returnValue;    
    }
}

/*  NeDB (Node Embedded Database!)
    Database path:
    - If not specified, it'll be under __dirname + "/db"; (which is under global install path)
    - If specified, its a resolved path to a specified folder
============================================================================= */

var db = {};
db.users = new Datastore({filename: path.join(config.dbPath, "/users.db"), autoload: true, onload: onUsersDbLoad});
db.connections = new Datastore({filename: path.join(config.dbPath, "/connections.db"), autoload: true});
db.queries = new Datastore({filename: path.join(config.dbPath, "/queries.db"), autoload: true});

function onUsersDbLoad (err) {
    db.users.ensureIndex({fieldName: 'email', unique: true}, function (err) {
       if (err) console.log(err);
    });
    // if an admin was passed in the command line, check to see if a user exists with that email
    // if so, set the admin to true
    // if not, whitelist the email address.
    // Then write to console that the person should visit the signup url to finish registration.
    if (argv.admin) {
        db.users.findOne({email: argv.admin}, function (err, user) {
            if (user) {
                db.users.update({_id: user._id}, {$set: {admin: true}}, {}, function (err) {
                    if (err) {
                        console.log("ERROR: could not make " + argv.admin + " an admin.");
                    } else {
                        console.log(argv.admin + " should now have admin access.");
                    }
                });
            } else {
                var newAdmin = {
                    email: argv.admin,
                    admin: true
                }
                db.users.insert(newAdmin, function (err, newUser) {
                    if (err) {
                        console.log("\nERROR: could not make " + argv.admin + " an admin.");
                    } else {
                        console.log("\n" + argv.admin + " has been whitelisted with admin access.");
                        console.log("\nPlease visit http://localhost:" + config.port + "/signup/ to complete registration.");
                    }
                });
            }
        });
    }
}

var oneDay = 24 * 60 * 60 * 1000;
for (var collection in db) {
    db[collection].persistence.setAutocompactionInterval(oneDay);
}

/*  Express setup
============================================================================= */
var app = express();


// all environments
app.set('port', config.port);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.bodyParser());
app.use(express.methodOverride()); // simulate PUT/DELETE via POST in client by <input type="hidden" name="_method" value="put" />
app.use(express.cookieParser(config.passphrase)); // populates req.cookies with an object
app.use(express.cookieSession());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.logger('dev'));
app.use(function(req, res, next){
	// Logging for test purposes
	//console.log('req.session');
	//console.log(req.session);
	next();
});
app.use(function (req, res, next) {
    // Boostrap res.locals with any common variables
    res.locals.message = null;
    res.locals.navbarConnections = [];
    res.locals.debug = null;
    // add session to res.locals for template usage if necessary
    if (req.session) {
		res.locals.session = req.session;
	} else {
		res.locals.session = null;
	}
	next();
});
app.use(function (req, res, next) {
    // if not signed in redirect to sign in page
    if (req.session && req.session.userId) {
        next();
    } else if (req._parsedUrl.pathname === '/signin' || req._parsedUrl.pathname === '/signup') {
        next();
    } else {
        res.redirect('/signin');
    }
});
app.use(app.router);

// development only
if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}

app.locals.title = 'Query Server';


/*  Pages/API begins here
    
    /            (redirects default depending if logged in or not)
    /signup      (open to everyone?)
    /signin      (default if not logged in)
    /queries     (default if logged in)
    /connections (list/create/update/delete connections)
============================================================================= */
function renderHomePage (req, res) {
    res.location('/');
    res.render('index');
}

/*	Homepage
============================================================================= */
app.get('/', function(req, res){
    db.connections.findOne({}, function (err, doc) {
        if (doc) {
            res.redirect('/queries');
        } else {
            res.redirect('/connections');
        }
    });
});


/*	Sign Up
============================================================================= */
function signupBodyToLocals (req, res, next) {
    res.locals.password = req.body.password || '';
    res.locals.passwordConfirmation = req.body.passwordConfirmation || '';
    res.locals.email = req.body.email || '';
    next();
}

function notIfSignedIn (req, res, next) {
    if (req.session && req.session.userId) {
        res.locals.debug = {message: "Already signed in - why do you need to sign up?"};
        renderHomePage(req, res);
    } else {
        next();
    }
}

app.get('/signup', notIfSignedIn, signupBodyToLocals, function (req, res) {
	res.render('signup');
});

app.post('/signup', signupBodyToLocals, function (req, res) {
	if (req.body.password !== req.body.passwordConfirmation) {
		res.render('signup', {message: 'passwords are not match'});
	} else {
        bcrypt.hash(req.body.password, null, null, function(err, hash) {
			var bodyUser = {
                email: req.body.email,
                passhash: hash,
                modifiedDate: new Date(),
                createdDate: new Date()
            };
            db.users.findOne({email: bodyUser.email}, function (err, user) {
                if (user) {
                    db.users.update({_id: user._id}, {$set: bodyUser}, {}, function (err) {
                        req.session.userId = user._id;
                        res.redirect('/');
                    });
                } else if (err) {
                    console.log(err);
                    res.render('signup', {message: 'An error happened.'});
                } else {
                    // not whitelisted?
                    console.log(user);
                    res.render('signup', {message: 'Sorry, but that email address has not been whitelisted yet.'});
                }
            });
		});
	}
});


/*	Sign In / Out
============================================================================= */
function signinBodyToLocals (req, res, next) {
    res.locals.email = req.body.email || '';
    res.locals.password = req.body.password || '';
    next();
}

app.get('/signin', signinBodyToLocals, function (req, res) {
	res.render('signin');
});

app.post('/signin', signinBodyToLocals, function (req, res) {
	db.users.findOne({email: req.body.email}, function (err, doc) {
        if (doc) {
            bcrypt.compare(req.body.password, doc.passhash, function (err, isMatch) {
                if (isMatch) {
                    // match! redirect home
                    req.session.userId = doc._id;
                    req.session.admin = doc.admin;
                    req.session.email = doc.email;
                    res.redirect('/');
                } else {
                    // render signin page again
                    res.render('signin', {message: "wrong email or password"});
                }
            });
        } else {
            res.render('signin', {message: "wrong email or password"});
        }
	});
});

app.get('/signout', function (req, res) {
	req.session = null;
	res.locals.session = req.session; // gotta clear this here too for UI reasons
	res.redirect('/signin');
});

/*	Users
============================================================================= */
function mustBeAdmin (req, res, next) {
    db.users.findOne({_id: req.session.userId}, function (err, user) {
        res.locals.user = user;
        if (user.admin) {
            next();
        } else {
            res.location('/error');
            res.locals.errorMessage = "You must be an admin to do that";
            res.render('error');
        }
    });
}

function renderUsers (req, res) {
    db.users.find({}, function (err, users) {
        res.render('users', {users: users});
    });   
}

app.get('/users', mustBeAdmin, renderUsers);

app.post('/users/whitelist', mustBeAdmin, function (req, res) {
    var user = {
        email: req.body.email,
        admin: (req.body.admin ? true : false)
    }
    db.users.insert(user, function (err, newUser) {
        if (err) {
            console.log(err);
            res.location('/users');
            res.locals.debug = "Couldn't add new user for some reason.";
            renderUsers(req, res);
        } else {
            res.redirect('users');
        }
    });
});

app.post('/users/make-admin/:_id', mustBeAdmin, function (req, res) {
    db.users.update({_id: req.params._id}, {$set: {admin: true}}, {}, function (err) {
        res.redirect('users');
    });
});

app.post('/users/remove-admin/:_id', mustBeAdmin, function (req, res) {
    // can't unadmin one's self
    if (req.session.userId === req.params._id) {
        res.location('/users');
        res.locals.debug = "You can't unadmin yourself!";
        renderUsers(req, res);
    } else {
        db.users.update({_id: req.params._id}, {$set: {admin: false}}, {}, function (err) {
            res.redirect('users');
        });
    }
        
})

app.delete('/users/:_id', mustBeAdmin, function (req, res) {
    db.users.remove({_id: req.params._id}, function (err, removed) {
        res.redirect('/users');
    });
});

/*    connections

create → POST    /collection
read → GET       /collection[/id]
update → PUT     /collection/id
delete → DELETE  /collection/id
============================================================================= */
app.get('/connections', mustBeAdmin, function (req, res) {
    db.connections.find({}, function (err, connections) {
        connections = _.sortBy(connections, function(c) {
            return c.name.toLowerCase();
        });
        res.render('connections', {connections: connections});
    });
});

app.get('/connections/:_id', mustBeAdmin, function (req, res) {
    db.connections.findOne({_id: req.params._id}, function (err, connection) {
        var encryptedUsername, encryptedPassword;
        if (!connection) {
            connection = {
                name: '',
                driver: '',
                host: '',
                database: '',
                username: '',
                password: '',
                createdDate: null,
                modifiedDate: null
            };
        } else {
            // decrypt connection username and password
            encryptedUsername = connection.username;
            encryptedPassword = connection.password;
            connection.username = decipher(connection.username);
            connection.password = decipher(connection.password);
        }
        res.render('connection', {
            connection: connection
        });
    });
});

app.post('/connections/new', mustBeAdmin, function (req, res) {
    var connection = {
        name: req.body.name,
        driver: req.body.driver,
        host: req.body.host,
        database: req.body.database,
        username: req.body.username,
        password: req.body.password,
        createdDate: new Date(),
        modifiedDate: new Date()
    };
    // encrypt connection username and password
    connection.username = cipher(connection.username);
    connection.password = cipher(connection.password);
    
    db.connections.insert(connection, function (err, connection) {
        if (err) {
            console.log(err);
            res.render('connection', {debug: err});
        } else {
            res.redirect('/connections');
        }
    });
});

function testConnection (req, res) {
    var bodyConnection = {
        name: req.body.name,
        driver: req.body.driver,
        host: req.body.host,
        database: req.body.database,
        username: req.body.username,
        password: req.body.password
    }; 
    runQuery("SELECT 'success' AS TestQuery;", bodyConnection, function (err, results) {
        if (err) {
            console.log(err);
            res.send({
                success: false,
                err: err
            });
        } else {
            console.log(results.rows);
            res.send({
                success: true,
                results: results.rows
            });
        }
    });
}

app.post('/connections/test', mustBeAdmin, testConnection);
app.put('/connections/test', mustBeAdmin, testConnection);

app.put('/connections/:_id', mustBeAdmin, function (req, res) {
    // TODO - make more dynamic based on database driver (SSL?)
    var bodyConnection = {
        name: req.body.name,
        driver: req.body.driver,
        host: req.body.host,
        database: req.body.database,
        username: req.body.username,
        password: req.body.password
    };
    // encrypt connection username and password
    bodyConnection.username = cipher(bodyConnection.username);
    bodyConnection.password = cipher(bodyConnection.password);
    
    db.connections.findOne({_id: req.params._id}, function (err, connection) {
        _.merge(connection, bodyConnection);
        connection.modifiedDate = new Date();
        db.connections.update({_id: req.params._id}, connection, {}, function (err, numReplaced) {
            res.redirect('/connections');
        });
    });
});

app.delete('/connections/:_id', mustBeAdmin, function (req, res) {
    db.connections.remove({_id: req.params._id}, function (err, removed) {
        res.redirect('/connections');
    });
});


/*    Queries
create → POST    /collection
read → GET       /collection[/id]
update → PUT     /collection/id
delete → DELETE  /collection/id
============================================================================= */
app.get('/queries', function (req, res) {
    console.log(req.query);
    db.connections.find({}, function (err, connections) {
        var connectionsById = _.indexBy(connections, '_id');
        var filter = {};
        if (req.query && req.query.tag) {
            filter.tags = req.query.tag;
        }
        console.log(filter);
        db.queries.find(filter, function (err, queries) {
            queries = _.sortBy(queries, function(q) {return new Date() - q.lastAccessedDate});
            res.render('queries', {queries: queries, connectionsById: connectionsById, filter: filter});
        });
    });
});

app.get('/queries/:_id', function (req, res) {
    var ua = req.headers['user-agent'];
    var os = uaParser.parseOS(ua).toString();
    res.locals.isMac = (os.search(/mac/i) >= 0);
    if (res.locals.isMac) {
        res.locals.controlKeyText = 'Command';
    } else {
        res.locals.controlKeyText = 'Ctrl';
    }
    db.connections.find({}, function (err, connections) {
        if (req.params._id === 'new') {
            res.render('query', {
                query: {}, 
                navbarConnections: connections
            });
        } else {
            db.queries.findOne({_id: req.params._id}, function (err, query) {
                // TODO: render error if this fails?
                db.queries.update({_id: req.params._id}, {$set: {lastAccessedDate: new Date()}}, {}, noop);
                if (query && query.tags) query.tags = query.tags.join(', ');
                res.render('query', {
                    query: query, 
                    navbarConnections: connections
                });
            });
        }
    });
});

app.post('/run-query', function (req, res) {
    //TODO: log usage stuff about it to the query db
    
    db.connections.findOne({_id: req.body.connectionId}, function (err, connection) {
        connection.username = decipher(connection.username);
        connection.password = decipher(connection.password);
        var start = new Date();
        runQuery(req.body.queryText, connection, function (err, results) {
            var end = new Date();
            if (err) {
                console.log(err);
                res.send({
                    success: false,
                    err: err
                });
            } else {
                res.send({
                    success: true,
                    serverMs: end - start,
                    results: results.rows
                });
            }
        });
    })
});

app.get('/schema-info/:connectionId', function (req, res) {
    db.connections.findOne({_id: req.params.connectionId}, function (err, connection) {
        connection.username = decipher(connection.username);
        connection.password = decipher(connection.password);
        
        var tableAndColumnSql = "SELECT t.table_type, t.table_schema, t.table_name, c.column_name, c.data_type, c.is_nullable "
                            + " FROM INFORMATION_SCHEMA.tables t "
                            + " JOIN INFORMATION_SCHEMA.columns c ON t.table_schema = c.table_schema AND t.table_name = c.table_name "
                            + " WHERE t.table_schema NOT IN ('information_schema', 'pg_catalog') "
                            + " ORDER BY t.table_type, t.table_schema, t.table_name, c.ordinal_position ";
                            
        var tree = {};
        
        runQuery(tableAndColumnSql, connection, function (err, results) {
            if (err) {
                console.log(err);
                res.send({success: false});
            } else {
               
                var byTableType = _.groupBy(results.rows, "table_type");
                for (var tableType in byTableType) {
                    tree[tableType] = {};
                    var bySchema = _.groupBy(byTableType[tableType], "table_schema");
                    for (var schema in bySchema) {
                        tree[tableType][schema] = {};
                        var byTableName = _.groupBy(bySchema[schema], "table_name");
                        for (var tableName in byTableName) {
                            tree[tableType][schema][tableName] = byTableName[tableName];
                        }
                    }
                }
                
                /*
                So at this point, tree should look like this:
                tree: {
                    "table": {
                        "dbo": {
                            "tablename": [
                                {
                                    column_name: "the column name",
                                    data_type: "string",
                                    is_nullable: "no"
                                }
                            ]
                        }
                    }
                }
                */
                res.send(tree);
                //res.render('table-tree', {tree: tree});
            }
        });
    })
})

app.post('/queries/:_id', function (req, res) {
    // save the query, to the query db
    var bodyQuery = {
        name: req.body.name,
        tags: req.body.tags,
        connectionId: req.body.connectionId,
        queryText: req.body.queryText
    };
    if (req.params._id == "new") {
        bodyQuery.createdDate = new Date();
        bodyQuery.modifiedDate = new Date();
        db.queries.insert(bodyQuery, function (err, query) {
            if (err) {
                console.log(err);
                res.send({err: err, success: false});
            } else {
                res.send({success: true, query: query});
            }
        });
    } else {
        // This style update merges the bodyQuery values to whatever objects 
        // are matched by the initial filter (in this case, _id, which will only match 1 query)
        db.queries.update({_id: req.params._id}, {$set: bodyQuery}, {}, function (err) {
            if (err) {
                console.log(err);
                res.send({err: err, success: false});
            } else {
                bodyQuery._id = req.params._id;
                res.send({success: true, query: bodyQuery});
            }
        });
    }
});

app.delete('/queries/:_id', function (req, res) {
    db.queries.remove({_id: req.params._id}, function (err, removed) {
        res.redirect('/queries');
    });
});

app.get('/error', function (req, res) {
    res.render('error');
});

/*	Start the Server
============================================================================= */
http.createServer(app).listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});