const fs = require('fs');
const path = require('path');
const express = require('express');
const helmet = require('helmet');
const pino = require('pino');
const redis = require('redis');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const MemoryStore = require('memorystore')(session);
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const RedisStore = require('connect-redis')(session);
const appLog = require('./lib/app-log');
const Webhooks = require('./lib/webhooks.js');
const bodyParser = require('body-parser');
const favicon = require('serve-favicon');
const passport = require('passport');
const authStrategies = require('./auth-strategies');
const sessionlessAuth = require('./middleware/sessionless-auth.js');
const ResponseUtils = require('./lib/response-utils.js');
const expressPinoLogger = require('express-pino-logger');

// This is a workaround till BigInt is fully supported by the standard
// See https://tc39.es/ecma262/#sec-ecmascript-language-types-bigint-type
// and https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt
// If this is not done, then a JSON.stringify(BigInt) throws
// "TypeError: Do not know how to serialize a BigInt"
/* global BigInt:writable */
/* eslint no-extend-native: ["error", { "exceptions": ["BigInt"] }] */
BigInt.prototype.toJSON = function () {
  return this.toString();
};

/**
 * Create an express app using config
 * @param {object} config
 */
async function makeApp(config, models) {
  if (typeof config.get !== 'function') {
    throw new Error('config is required to create app');
  }
  if (!models) {
    throw new Error('models is required to create app');
  }

  const webhooks = new Webhooks(config, models, appLog);

  const expressPino = expressPinoLogger({
    level: config.get('webLogLevel'),
    timestamp: pino.stdTimeFunctions.isoTime,
    name: 'sqlpad-web',
    // express-pino-logger logs all the headers by default
    // Removing these for now but open to adding them back in based on feedback
    redact: {
      paths: [
        'req.headers',
        'res.headers',
        'req.remoteAddress',
        'req.remotePort',
      ],
      remove: true,
    },
  });

  /*  Express setup
  ============================================================================= */
  const app = express();

  // Default helmet protections, minus frameguard (becaue of sqlpad iframe embed), adding referrerPolicy
  app.use(helmet.dnsPrefetchControl());
  app.use(helmet.hidePoweredBy());
  app.use(helmet.hsts({}));
  app.use(helmet.ieNoOpen());
  app.use(helmet.noSniff());
  app.use(helmet.xssFilter());
  app.use(helmet.referrerPolicy({ policy: 'same-origin' }));

  // Decorate req and res with SQLPad objects and utils
  app.use(function (req, res, next) {
    req.config = config;
    req.models = models;
    req.appLog = appLog;
    req.webhooks = webhooks;

    res.utils = new ResponseUtils(res, next);

    next();
  });

  app.use(expressPino);

  // Use favicon middleware if favicon exists
  // Thist just loads it and serves from memory
  const icoPath = path.join(__dirname, '/public/favicon.ico');
  if (fs.existsSync(icoPath)) {
    app.use(favicon(icoPath));
  }

  app.use(bodyParser.json());
  app.use(
    bodyParser.urlencoded({
      extended: true,
    })
  );

  const cookieMaxAgeMs = parseInt(config.get('sessionMinutes'), 10) * 60 * 1000;

  const sessionOptions = {
    saveUninitialized: false,
    resave: true,
    rolling: true,
    cookie: { maxAge: cookieMaxAgeMs },
    secret: config.get('cookieSecret'),
    name: config.get('cookieName'),
  };
  const sessionStore = config.get('sessionStore').toLowerCase();

  switch (sessionStore) {
    case 'file': {
      const sessionPath = path.join(config.get('dbPath'), '/sessions');
      sessionOptions.store = new FileStore({
        path: sessionPath,
        logFn: () => {},
      });
      break;
    }
    case 'memory': {
      sessionOptions.store = new MemoryStore({
        checkPeriod: cookieMaxAgeMs,
      });
      break;
    }
    case 'database': {
      sessionOptions.store = new SequelizeStore({
        db: models.sequelizeDb.sequelize,
        table: 'Sessions',
      });
      // SequelizeStore supports the touch method so per the express-session docs this should be set to false
      sessionOptions.resave = false;
      // SequelizeStore docs mention setting this to true if SSL is done outside of Node
      // Not sure we have any way of knowing based on current config
      // sessionOptions.proxy = true;
      break;
    }
    case 'redis': {
      const redisUri = config.get('redisUri');
      if (!redisUri) {
        throw new Error(
          `Redis session store requires SQLPAD_REDIS_URI to be set`
        );
      }
      const redisClient = redis.createClient(redisUri);
      sessionOptions.store = new RedisStore({ client: redisClient });
      sessionOptions.resave = false;
      break;
    }
    default: {
      throw new Error(`Invalid session store ${sessionStore}`);
    }
  }

  app.use(session(sessionOptions));

  const baseUrl = config.get('baseUrl');

  app.use(baseUrl, express.static(path.join(__dirname, 'public')));

  /*  Passport setup
  ============================================================================= */
  await authStrategies(config, models);
  app.use(passport.initialize());
  app.use(passport.session());

  /*  Routes
  ============================================================================= */
  const preAuthRouters = [
    require('./routes/forgot-password.js'),
    require('./routes/password-reset.js'),
    require('./routes/signout.js'),
    require('./routes/signup.js'),
    require('./routes/signin.js'),
    require('./routes/google-auth.js'),
    require('./routes/auth-oidc.js'),
    require('./routes/saml.js'),
  ];

  // Add pre-auth routes to app
  preAuthRouters.forEach((router) => app.use(baseUrl, router));

  // Add sessionless authentication middleware
  // This handles things like HTTP basic, auth proxy, disable auth, and JWT service tokens
  // These attempt to authenticate the request based on information passed every request
  // They do not persist a session
  app.use(sessionlessAuth);

  const authRequiredRouters = [
    require('./routes/statement-results.js'),
    require('./routes/queries.js'),
    require('./routes/drivers.js'),
    require('./routes/users.js'),
    require('./routes/connections.js'),
    require('./routes/connection-accesses.js'),
    require('./routes/connection-clients.js'),
    require('./routes/test-connection.js'),
    require('./routes/query-history.js'),
    require('./routes/schema-info.js'),
    require('./routes/tags.js'),
    require('./routes/format-sql.js'),
    require('./routes/service-tokens.js'),
    require('./routes/batches.js'),
    require('./routes/statements.js'),
  ];

  // Add all core routes to the baseUrl except for the */api/app route
  authRequiredRouters.forEach((router) => app.use(baseUrl, router));

  // Add '*/api/app' route last and without baseUrl
  app.use(require('./routes/app.js'));

  // For any missing api route, return a 404
  // NOTE - this cannot be a general catch-all because it might be a valid non-api route from a front-end perspective
  app.use(baseUrl + '/api/', function (req, res) {
    req.log.debug('reached catch all api route');
    return res.utils.notFound();
  });

  // Add an error handler for /api
  app.use(baseUrl + '/api/', function (err, req, res, next) {
    if (res.headersSent) {
      return next(err);
    }
    appLog.error(err);
    return res.status(500).json({
      title: 'Internal Server Error',
    });
  });

  // Anything else should render the client-side app
  // Client-side routing will take care of things from here
  // Because index.html will be served via static plugin,
  // we need to rename it to something else and switch out the URLs to consider the baseUrl
  const indexPath = path.join(__dirname, 'public/index.html');
  const indexTemplatePath = path.join(__dirname, 'public/index-template.html');

  if (fs.existsSync(indexPath)) {
    fs.renameSync(indexPath, indexTemplatePath);
  }

  if (fs.existsSync(indexTemplatePath)) {
    const html = fs.readFileSync(indexTemplatePath, 'utf8');
    const baseUrlHtml = html
      .replace(/="\/stylesheets/g, `="${baseUrl}/stylesheets`)
      .replace(/="\/javascripts/g, `="${baseUrl}/javascripts`)
      .replace(/="\/images/g, `="${baseUrl}/images`)
      .replace(/="\/fonts/g, `="${baseUrl}/fonts`)
      .replace(/="\/static/g, `="${baseUrl}/static`);
    app.use((req, res) => res.send(baseUrlHtml));
  } else {
    const msg = `No UI template detected. Build client/ and copy files to server/public/`;
    appLog.warn(msg);
    app.use((req, res) => {
      appLog.warn(msg);
      res.status(404).send(msg);
    });
  }

  return app;
}

module.exports = makeApp;
