#!/usr/bin/env node

var express = require('express');
var router = express.Router();
var http = require('http');
var path = require('path');
var updateNotifier = require('update-notifier');
var db = require('./lib/db.js');
var packageJson = require('./package.json');
var app = express();


/*  Automatic notifier thing that an update is available
============================================================================= */
updateNotifier({pkg: packageJson}).notify();


/*  Env/Cli Config stuff
============================================================================= */
var config = require('./lib/config.js');
if (config.get("debug")) {
    console.log("CONFIG VALUES:");
    console.log(config.getAllValues());
}


/*  Determine if app should have open registration or not
    
    If there are no admin accounts with created dates, 
    registration will be open.
    
    The first account created will be an admin account. 
============================================================================= */
// TODO - move this into middleware
var openAdminFilter = {
    admin: true, 
    createdDate: {
        $lte: new Date()
    }
};
db.users.findOne(openAdminFilter, function (err, doc) {
    if (doc) {
        app.set('openAdminRegistration', false);
    } else {
        console.log('\nNo admins found - open admin registration enabled.');
        console.log('Visit /signup to register an admin and close open admin registration.')
        app.set('openAdminRegistration', true);
    }
});



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

if (config.get('debug')) app.use(errorhandler());
app.use(favicon(__dirname + '/public/images/favicon.ico'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

// custom methodOverride behavior that was used in method-override@1.x.x
// simulate PUT/DELETE via POST in client by <input type="hidden" name="_method" value="put" />
app.use(methodOverride(function(req, res){
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it 
        var method = req.body._method
        delete req.body._method
        return method
    }
}));
app.use(methodOverride('_method'));  // method override for action="/resource?_method=DELETE"
app.use(methodOverride('X-HTTP-Method-Override')) // using a header
app.use(cookieParser(config.get('passphrase'))); // populates req.cookies with an object
app.use(cookieSession({secret: config.get('passphrase')}));
app.use(connectFlash());
app.use(passport.initialize());
app.use(passport.session());
app.use(config.get('baseUrl'), express.static(path.join(__dirname, 'public')));
if (config.get('debug')) app.use(morgan('dev'));
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
    res.locals.baseUrl = config.get('baseUrl');

    // Expose key-value configs as a common variable passed on to browser
    // TODO: sensitive configs should not go to browser
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
        
        res.locals.configItemsJSONString = JSON.stringify(keyValueConfig);
      }

      next();
    });
});
app.use(function (req, res, next) {
    // if not signed in redirect to sign in page
    if (req.isAuthenticated()) {
        next();
    } else if (req._parsedUrl.pathname === (config.get('baseUrl') + '/signin') 
            || req._parsedUrl.pathname === (config.get('baseUrl') + '/signup') 
            || req._parsedUrl.pathname.indexOf(config.get('baseUrl') + '/auth/') == 0) {
        next();
    } else if (app.get('openRegistration')) {
        // if there are no users whitelisted, direct to signup
        res.redirect(config.get('baseUrl') + '/signup');
    } else {
        res.redirect(config.get('baseUrl') + '/signin');
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
app.use('/config-values', mustBeAdmin);



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
require('./routes/config-values.js')(app, router);
require('./routes/tags.js')(app, router);

app.use(config.get('baseUrl'), router);

/*	Start the Server
============================================================================= */
http.createServer(app).listen(config.get('port'), config.get('ip'), function(){
	console.log('\nWelcome to ' + app.locals.title + '!. Visit http://'+(config.get('ip') == '0.0.0.0' ? 'localhost' : config.get('ip')) + ':' + config.get('port') + config.get('baseUrl') + ' to get started');
});
