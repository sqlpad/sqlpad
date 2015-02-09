#!/usr/bin/env node

var express = require('express');
var http = require('http');
var path = require('path');
var updateNotifier = require('update-notifier');
var packageJson = require('./package.json');
var app = express();


/*  Automatic notifier thing that an update is available
============================================================================= */
var notifier = updateNotifier({
    packageName: packageJson.name, 
    packageVersion: packageJson.version
});

if (notifier.update) {
    notifier.notify();
}


/*  Boostrap app object with stuff
    This allows us to pass app around and all the related utility/helper/db 
    functions and variables go with it.
============================================================================= */
require('./lib/add-cli-config-to-app.js')(app);
require('./lib/add-db-to-app.js')(app);
require('./lib/add-cipher-decipher-to-app.js')(app);
require('./lib/add-open-admin-registration-to-app.js')(app);


/*  Express setup
============================================================================= */
var bodyParser = require('body-parser');
var favicon = require('serve-favicon');
var methodOverride = require('method-override');
var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');
var morgan = require('morgan');

app.locals.title = 'SqlPad';
app.locals.version = packageJson.version;
app.set('packageJson', packageJson);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(favicon(__dirname + '/public/images/favicon.ico'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(methodOverride()); // simulate PUT/DELETE via POST in client by <input type="hidden" name="_method" value="put" />
app.use(cookieParser(app.get('passphrase'))); // populates req.cookies with an object
app.use(cookieSession({secret: app.get('passphrase')}));
app.use(express.static(path.join(__dirname, 'public')));
if (app.get('dev')) app.use(morgan('dev'));
app.use(function (req, res, next) {
    // Boostrap res.locals with any common variables
    res.locals.message = null;
    res.locals.navbarConnections = [];
    res.locals.debug = null;
    res.locals.query = null;
    res.locals.queryMenu = false;
    res.locals.session = req.session || null;
    res.locals.pageTitle = "";
    res.locals.openAdminRegistration = app.get('openAdminRegistration');
	next();
});
app.use(function (req, res, next) {
    // if not signed in redirect to sign in page
    if (req.session && req.session.userId) {
        next();
    } else if (req._parsedUrl.pathname === '/signin' || req._parsedUrl.pathname === '/signup') {
        next();
    } else if (app.get('openRegistration')) {
        // if there are no users whitelisted, direct to signup
        res.redirect('/signup');
    } else {
        res.redirect('/signin');
    }
});


/*  Must Be Admin middleware
    Some places are restricted to admins. 
    This middleware and middleware assignment handles that.
============================================================================= */
function mustBeAdmin (req, res, next) {
    if (req.session.admin) {
        next();
    } else {
        res.location('/error');
        res.locals.errorMessage = "You must be an admin to do that";
        res.render('error');
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
require('./routes/homepage.js')(app);
require('./routes/onboarding.js')(app);
require('./routes/user-admin.js')(app);
require('./routes/connection-admin.js')(app);
require('./routes/queries.js')(app);
require('./routes/run-query.js')(app); // ajaxy route used for executing query and getting results
require('./routes/download-results.js')(app); // streams cached query results to browser
require('./routes/schema-info.js')(app);
require('./routes/configs.js')(app);

app.get('/error', function (req, res) {
    res.render('error', {errorMessage: "this is a message"});
});

function errorHandler(err, req, res, next) {
    res.status(500);
    res.render('error', { error: err });
}
app.use(errorHandler);

/*	Start the Server
============================================================================= */
http.createServer(app).listen(app.get('port'), function(){
	console.log('\nWelcome to ' + app.locals.title + '!. Visit http://localhost:' + app.get('port') + ' to get started');
});