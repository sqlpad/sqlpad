#!/usr/bin/env node

var express = require('express');
var http = require('http');
var path = require('path');
var updateNotifier = require('update-notifier');
var packageJson = require('./package.json');
var app = express();


/*  Automatic notifier thing that an update is available
============================================================================= */
updateNotifier({pkg: packageJson}).notify();


/*  Env/Cli Config stuff
============================================================================= */
const config = require('./lib/config.js');
const BASE_URL = config.get('baseUrl');
const IP = config.get('ip');
const PORT = config.get('port');
const DISABLE_USERPASS_AUTH = config.get('disableUserpassAuth');
const GOOGLE_CLIENT_ID = config.get('googleClientId');
const GOOGLE_CLIENT_SECRET = config.get('googleClientSecret');
const PUBLIC_URL = config.get('publicUrl');
const DEBUG = config.get('debug');
const PASSPHRASE = config.get('passphrase');

if (DEBUG) {
    console.log("Config Values:");
    console.log(config.getAllValues());
}


/*  Run migrations on data if necessary
============================================================================= */
require('./lib/migrate-schema.js');


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

if (DEBUG) app.use(errorhandler());
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
app.use(cookieParser(PASSPHRASE)); // populates req.cookies with an object
app.use(cookieSession({secret: PASSPHRASE}));
app.use(connectFlash());
app.use(passport.initialize());
app.use(passport.session());
app.use(BASE_URL, express.static(path.join(__dirname, 'public')));
if (DEBUG) app.use(morgan('dev'));
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
    res.locals.user = req.user;
    res.locals.isAuthenticated = req.isAuthenticated();
    res.locals.renderNav = true;
    res.locals.baseUrl = BASE_URL;
    // Expose key-value configs as a common variable passed on to browser
    // TODO: sensitive configs should not go to browser
    res.locals.configItemsJSONString = JSON.stringify(config.getAllValues());
    next();
});
app.use(require('./middleware/auth-redirects.js'));


/*  Must Be Admin middleware
    Some places are restricted to admins.
    This middleware and middleware assignment handles that.
============================================================================= */
const mustBeAdmin = require('./middleware/must-be-admin.js');
app.use(BASE_URL + '/connections', mustBeAdmin);
app.use(BASE_URL + '/users', mustBeAdmin);
app.use(BASE_URL + '/config-values', mustBeAdmin);


/*  Passport setup
============================================================================= */
require('./middleware/passport.js');


/*  Routes 

    Generally try to follow the standard convention.
    But sometimes I don't though:

    create → POST    /collection
    read → GET       /collection[/id]
    update → PUT     /collection/id
    delete → DELETE  /collection/id
============================================================================= */
var routers = [
    require('./routes/homepage.js'),
    require('./routes/users.js'),
    require('./routes/connections.js'),
    require('./routes/queries.js'),
    require('./routes/query-result.js'), 
    require('./routes/download-results.js'), // streams result download to browser
    require('./routes/schema-info.js'),
    require('./routes/config-values.js'),
    require('./routes/tags.js')
];

// if a route should only conditionally exist load it here
// routers.push(require('./routes/another-router.js'));
if (!DISABLE_USERPASS_AUTH) {
    routers.push(require('./routes/signup-signin-signout.js'));
}

if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET && PUBLIC_URL) {
    console.log("Enabling Google authentication Strategy.")
    routers.push(require('./routes/oauth.js'));
}

routers.forEach(function (router) {
    app.use(BASE_URL, router);
});


/*	Start the Server
============================================================================= */
http.createServer(app).listen(PORT, IP, function () {
	console.log('\nWelcome to ' + app.locals.title + '!. Visit http://' + (IP == '0.0.0.0' ? 'localhost' : IP) + ':' + PORT + BASE_URL + ' to get started');
});
