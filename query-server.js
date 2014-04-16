var express = require('express');
var http = require('http');
var path = require('path');
var bcrypt = require('bcrypt-nodejs'); //https://www.npmjs.org/package/bcrypt-nodejs (the native one is icky for windows)


var app = express();
var thirtyDays = 30 * 24 * 60 * 60 * 1000;

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride()); // simulate PUT/DELETE via POST in client by <input type="hidden" name="_method" value="put" />
app.use(express.cookieParser('coooookiieeeeee')); // populates req.cookies with an object
app.use(express.cookieSession());
app.use(function(req, res, next){
	//	Logging for test purposes
	console.log('%s %s', req.method, req.url);
	console.log('req.signedCookies');
	console.log(req.signedCookies);
	console.log('req.session');
	console.log(req.session);
	next();
});
app.use(function (req, res, next) {
    // Boostrap res.locals with any common variables
    res.locals.message = null;
    // add session to res.locals for template usage if necessary
    if (req.session) {
		res.locals.session = req.session;
	} else {
		res.locals.session = null;
	}
	next();
});
app.use(function (req, res, next) {
    // TODO: Check if a remember cookie is found.
    // if so, add a regular session cookie for this session
    next();
});
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}

app.locals.title = 'Query Server';


/*	Homepage
------------------------------------------------------------------------------------------------- */
app.get('/', function(req, res){
	res.render('index');
});


/*	Sign Up
------------------------------------------------------------------------------------------------- */
app.get('/sign-up', function (req, res) {
	res.locals.password = req.body.password || '';
	res.locals.passwordConfirmation = req.body.passwordConfirmation || '';
	res.locals.email = req.body.email || '',
	res.locals.organizationName = req.body.organizationName || '';
	res.locals.remember = (req.body.remember ? true : false);
	res.render('sign-up');
});

app.post('/sign-up', function (req, res) {
	res.locals.password = req.body.password || '';
	res.locals.passwordConfirmation = req.body.passwordConfirmation || '';
	res.locals.email = req.body.email || '',
	res.locals.organizationName = req.body.organizationName || '';
	res.locals.remember = (req.body.remember ? true : false);
	/*
	if (req.body.password !== req.body.passwordConfirmation) {
		res.render('sign-up', {message: 'passwords are not match'});
	} else {
		knex('client').insert({name: req.body.organizationName}, 'client_id').exec(function (err, ids) {
			if (err) console.log(err);
			console.log(ids);
			var client_id = ids[0];
			bcrypt.hash(req.body.password, null, null, function(err, hash) {
				// Store hash in your password DB.
				knex('users').insert({
					email: req.body.email,
					client_id: client_id,
					passhash: hash,
					created_date: new Date(),
					modified_date: new Date()
				}, 'user_id').exec(function (err, userIds) {
					if (err) console.log(err);
					req.session.userId = userIds[0];
					req.session.clientId = client_id;
					if (req.body.remember) {
						var thirtyDays = 30*24*60*60*1000;
						//req.session.cookie.expires = new Date(Date.now() + thirtyDays);
						req.signedCookies.remember = "remember";
						//req.signedCookie.remember.maxAge = thirtyDays;
					} else {
						req.session.cookie.maxAge = false;
					}
					res.render('sign-up', {message: 'success?'});
				});
			});
		});
	}
	*/
});


/*	Log In / Out
------------------------------------------------------------------------------------------------- */
app.get('/log-in', function (req, res) {
	res.render('log-in');
});

app.post('/log-in', function (req, res) {
	res.render('log-in');
});

app.get('/log-out', function (req, res) {
	req.session = null;
	res.render('log-in', {message: 'SEE YAH'});
});

/*	Test
------------------------------------------------------------------------------------------------- */
app.get('/setcookie', function (req, res) {
	var thirtyDays = 30*24*60*60*1000;
	req.session.user_id = 1;
	req.session.client_id = "A Company";
	res.cookie('remember', {remember: "remember"}, {signed: true, maxAge: thirtyDays});
	res.render('test', {data: req.signedCookies});
});

app.get('/viewcookie', function (req, res) {
	res.render('test', {data: req.signedCookies});
});

app.get('/clearcookie', function (req, res) {
	req.session = null;
	res.render('test', {data: req.signedCookies});
});

/*	Start the Server
------------------------------------------------------------------------------------------------- */
http.createServer(app).listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});