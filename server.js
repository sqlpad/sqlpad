#!/usr/bin/env node

var express = require('express');
var router = express.Router();
var http = require('http');
var path = require('path');
var updateNotifier = require('update-notifier');
var packageJson = require('./package.json');
var app = express();


/*  Automatic notifier thing that an update is available
============================================================================= */
updateNotifier({pkg: packageJson}).notify();


/*  add config to app object
    TODO: remove dependency on attaching config values to app object
    Turns out node.js cache's the require() of a module
    Instead of attaching config to the app object,
    just require('./lib/config.js') around the app.
    (Sometimes we need config when we don't need the app object)
============================================================================= */
var config = require('./lib/config.js');
if (config.debug) {
    console.log("CONFIG:");
    console.log(config);
}
app.set('debug', config.debug);
app.set('passphrase', config.passphrase);
app.set('dbPath', config.dbPath);
app.set('port', config.port);
app.set('ip', config.ip);
app.set('baseUrl', config.baseUrl);
if (config.hasOwnProperty('dev')) app.set('dev', true);
if (config.admin) app.set('admin', config.admin);

/*  Boostrap app object with stuff
    This allows us to pass app around and all the related utility/helper/db
    functions and variables go with it.
    TODO: move to just requiring needed files directly
============================================================================= */
require('./lib/add-db-to-app.js')(app);
require('./lib/add-cipher-decipher-to-app.js')(app);
require('./lib/add-open-admin-registration-to-app.js')(app);
require('./lib/add-email-domain-whitelist-to-app.js')(app);


/*  Express setup
============================================================================= */
var bodyParser = require('body-parser');
var favicon = require('serve-favicon');
var methodOverride = require('method-override');
var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');
var morgan = require('morgan');
var passport = require('passport');
var connectFlash = require('connect-flash');
var errorhandler = require('errorhandler');

app.locals.title = 'SqlPad';
app.locals.version = packageJson.version;
app.set('packageJson', packageJson);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

if (process.env.NODE_ENV === 'development') {
  // only use in development
  app.use(errorhandler());
}
app.use(favicon(__dirname + '/public/images/favicon.ico'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(methodOverride()); // simulate PUT/DELETE via POST in client by <input type="hidden" name="_method" value="put" />
app.use(cookieParser(app.get('passphrase'))); // populates req.cookies with an object
app.use(cookieSession({secret: app.get('passphrase')}));
app.use(connectFlash());
app.use(passport.initialize());
app.use(passport.session());
app.use(config.baseUrl, express.static(path.join(__dirname, 'public')));
if (app.get('dev')) app.use(morgan('dev'));
app.use(function (req, res, next) {
    // Boostrap res.locals with any common variables
    res.locals.errors = req.flash('error');
    res.locals.message = null;
    res.locals.navbarConnections = [];
    res.locals.debug = null;
    res.locals.query = null;
    res.locals.queryMenu = false;
    res.locals.session = req.session || null;
    res.locals.pageTitle = "";
    res.locals.openAdminRegistration = app.get('openAdminRegistration');
    res.locals.user = req.user;
    res.locals.isAuthenticated = req.isAuthenticated();
    res.locals.baseUrl = config.baseUrl

    // Expose key-value configs as a common variable
    var db = app.get('db');

    db.config.find({}, function (err, configItems) {
      if (err) {
          res.send({
              success: false,
              error: err.toString()
          });
      } else {
        var keyValueConfig = {};
        for (var i = 0; i < configItems.length; i++) {
          keyValueConfig[configItems[i]['key']] = configItems[i]['value'];
        }
        
        res.locals.configItems = JSON.stringify(keyValueConfig);
      }

      next();
    });
});
app.use(function (req, res, next) {
    // if not signed in redirect to sign in page
    if (req.isAuthenticated()) {
        next();
    } else if (req._parsedUrl.pathname === config.baseUrl + '/signin' || req._parsedUrl.pathname === config.baseUrl + '/signup' || req._parsedUrl.pathname.indexOf(config.baseUrl + '/auth/') == 0) {
        next();
    } else if (app.get('openRegistration')) {
        // if there are no users whitelisted, direct to signup
        res.redirect(config.baseUrl + '/signup');
    } else {
        res.redirect(config.baseUrl + '/signin');
    }
});


/*  Must Be Admin middleware
    Some places are restricted to admins.
    This middleware and middleware assignment handles that.
============================================================================= */
function mustBeAdmin (req, res, next) {
    if (req.user.admin) {
        next();
    } else {
        throw "You must be an admin to do that";
    }
}
app.use('/connections', mustBeAdmin);
app.use('/users', mustBeAdmin);
app.use('/config', mustBeAdmin);



/*  Routes begins here

    The modules in ./routes/ are just functions that take the app object
    and build out the routes.

    /            (redirects to queries or connections)
    /signup      (open to everyone, but you gotta be whitelisted to use it)
    /signin      (default if not logged in)
    /queries     (lists queries)
    /connections (list/create/update/delete connections)

    Generally, I try to follow the standard convention.
    But sometimes I don't though:

    create → POST    /collection
    read → GET       /collection[/id]
    update → PUT     /collection/id
    delete → DELETE  /collection/id
============================================================================= */
require('./routes/oauth.js')(app, passport, router);
require('./routes/homepage.js')(app, router);
require('./routes/onboarding.js')(app, router);
require('./routes/user-admin.js')(app, router);
require('./routes/connections.js')(app, router);
require('./routes/queries.js')(app, router);
require('./routes/run-query.js')(app, router); // ajaxy route used for executing query and getting results
require('./routes/download-results.js')(app, router); // streams cached query results to browser
require('./routes/schema-info.js')(app, router);
require('./routes/configs.js')(app, router);
require('./routes/tags.js')(app, router);

app.use(config.baseUrl, router);

/*	Start the Server
============================================================================= */
http.createServer(app).listen(app.get('port'), app.get('ip'), function(){
	console.log('\nWelcome to ' + app.locals.title + '!. Visit http://'+(app.get('ip') == '0.0.0.0' ? 'localhost' : app.get('ip')) + ':' + app.get('port') + app.get('baseUrl') + ' to get started');
});
