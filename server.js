#!/usr/bin/env node

// Parse command line flags to see if anything special needs to happen
require('./lib/cli-flow.js')
var express = require('express')
var http = require('http')
var path = require('path')
var packageJson = require('./package.json')
var detectPort = require('detect-port')

/*  Env/Cli Config stuff
============================================================================= */
const config = require('./lib/config.js')
const BASE_URL = config.get('baseUrl')
const IP = config.get('ip')
const PORT = config.get('port')
const GOOGLE_CLIENT_ID = config.get('googleClientId')
const GOOGLE_CLIENT_SECRET = config.get('googleClientSecret')
const PUBLIC_URL = config.get('publicUrl')
const DEBUG = config.get('debug')
const PASSPHRASE = config.get('passphrase')

if (DEBUG) {
  console.log('Config Values:')
  console.log(config.getAllValues())
}

/*  Express setup
============================================================================= */
var bodyParser = require('body-parser')
var favicon = require('serve-favicon')
var cookieParser = require('cookie-parser')
var cookieSession = require('cookie-session')
var morgan = require('morgan')
var passport = require('passport')
var errorhandler = require('errorhandler')

var app = express()

app.locals.title = 'SqlPad'
app.locals.version = packageJson.version
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.set('env', (DEBUG ? 'development' : 'production'))

if (DEBUG) app.use(errorhandler())
app.use(favicon(path.join(__dirname, '/public/images/favicon.ico')))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: true
}))

app.use(cookieParser(PASSPHRASE)) // populates req.cookies with an object
app.use(cookieSession({secret: PASSPHRASE}))
app.use(passport.initialize())
app.use(passport.session())
app.use(BASE_URL, express.static(path.join(__dirname, 'public')))
if (DEBUG) app.use(morgan('dev'))
app.use(function (req, res, next) {
  // Boostrap res.locals with any common variables
  res.locals.message = null
  res.locals.navbarConnections = []
  res.locals.debug = null
  res.locals.query = null
  res.locals.queryMenu = false
  res.locals.session = req.session || null
  res.locals.pageTitle = ''
  res.locals.user = req.user
  res.locals.isAuthenticated = req.isAuthenticated()
  res.locals.baseUrl = BASE_URL
  next()
})

/*  Passport setup
============================================================================= */
require('./middleware/passport.js')

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
  require('./routes/app.js'),
  require('./routes/version.js'),
  require('./routes/users.js'),
  require('./routes/password-reset.js'),
  require('./routes/connections.js'),
  require('./routes/queries.js'),
  require('./routes/query-result.js'),
  require('./routes/download-results.js'), // streams result download to browser
  require('./routes/schema-info.js'),
  require('./routes/config-values.js'),
  require('./routes/tags.js'),
  require('./routes/signup-signin-signout.js')
]

if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET && PUBLIC_URL) {
  if (DEBUG) console.log('Enabling Google authentication Strategy.')
  routers.push(require('./routes/oauth.js'))
}

routers.forEach(function (router) {
  app.use(BASE_URL, router)
})

// for any missing api route, return a 404
app.use(BASE_URL + '/api/', function (req, res) {
  console.log('reached catch all api route')
  res.sendStatus(404)
})

// anything else should render the client-side app
// client-side routing will take care of things from here
app.use(function (req, res, next) {
  return res.render('index', {
    pageTitle: 'SqlPad'
  })
})

/*  Start the Server
============================================================================= */
detectPort(PORT).then(function (_port) {
  if (PORT !== _port) {
    console.log('\nPort %d already occupied. Using port %d instead.', PORT, _port)
    config.set('port', _port)
  }
  http.createServer(app).listen(_port, IP, function () {
    console.log('\nWelcome to ' + app.locals.title + '!. Visit http://' + (IP === '0.0.0.0' ? 'localhost' : IP) + ':' + _port + BASE_URL + ' to get started')
  })
})

