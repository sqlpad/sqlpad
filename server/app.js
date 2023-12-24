import fs from 'fs';
import path from 'path';
import express from 'express';
import helmet from 'helmet';
import pino from 'pino';
import redis from 'redis';
import session from 'express-session';
import FileStoreFactory from 'session-file-store';
import MemoryStoreFactory from 'memorystore';
import SequelizeStoreFactory from 'connect-session-sequelize';
import RedisStore from 'connect-redis';
import appLog from './lib/app-log.js';
import Webhooks from './lib/webhooks.js';
import bodyParser from 'body-parser';
import favicon from 'serve-favicon';
import passport from 'passport';
import authStrategies from './auth-strategies/index.js';
import sessionlessAuth from './middleware/sessionless-auth.js';
import ResponseUtils from './lib/response-utils.js';
import expressPinoLogger from 'express-pino-logger';
import serverDirname from './server-dirname.cjs';
import routePasswordReset from './routes/password-reset.js';
import routeSignout from './routes/signout.js';
import routeSignup from './routes/signup.js';
import routeSignin from './routes/signin.js';
import routeGoogleAuth from './routes/google-auth.js';
import routeAuthOidc from './routes/auth-oidc.js';
import routeSaml from './routes/saml.js';
import routeStatementResults from './routes/statement-results.js';
import routeQueries from './routes/queries.js';
import routeDrivers from './routes/drivers.js';
import routeUsers from './routes/users.js';
import routeConnections from './routes/connections.js';
import routeConnectionAccesses from './routes/connection-accesses.js';
import routeConnectionClients from './routes/connection-clients.js';
import routeConnectionSchema from './routes/connection-schema.js';
import routeTestConnection from './routes/test-connection.js';
import routeQueryHistory from './routes/query-history.js';
import routeSchemaInfo from './routes/schema-info.js';
import routeTags from './routes/tags.js';
import routeFormatSql from './routes/format-sql.js';
import routeServiceTokens from './routes/service-tokens.js';
import routeBatches from './routes/batches.js';
import routeStatements from './routes/statements.js';
import routeApp from './routes/app.js';

const FileStore = FileStoreFactory(session);
const MemoryStore = MemoryStoreFactory(session);
const SequelizeStore = SequelizeStoreFactory(session.Store);

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

  app.set('trust proxy', config.get('trustProxy'));

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
  const icoPath = path.join(serverDirname, '/public/favicon.ico');
  if (fs.existsSync(icoPath)) {
    app.use(favicon(icoPath));
  }

  app.use(
    bodyParser.json({
      limit: config.get('bodyLimit'),
    })
  );
  app.use(
    bodyParser.urlencoded({
      extended: true,
    })
  );

  const cookieMaxAgeMs = parseInt(config.get('sessionMinutes'), 10) * 60 * 1000;
  const cookieSameSite = config.get('sessionCookieSameSite');

  const sessionOptions = {
    saveUninitialized: false,
    resave: true,
    rolling: true,
    cookie: { maxAge: cookieMaxAgeMs, sameSite: cookieSameSite },
    secret: config.get('cookieSecret'),
    name: config.get('cookieName'),
  };

  sessionOptions.cookie.secure = config.get('cookieSecure');

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
      const redisClient = redis.createClient({
        url: config.get('redisUri'),
      });
      redisClient.connect().catch((error) => appLog.error(error));
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

  app.use(baseUrl, express.static(path.join(serverDirname, 'public')));

  /*  Passport setup
  ============================================================================= */
  await authStrategies(config, models);
  app.use(passport.initialize());
  app.use(passport.session());

  /*  Routes
  ============================================================================= */
  const preAuthRouters = [
    routePasswordReset,
    routeSignout,
    routeSignup,
    routeSignin,
    routeGoogleAuth,
    routeAuthOidc,
    routeSaml,
  ];

  // Add pre-auth routes to app
  preAuthRouters.forEach((router) => app.use(baseUrl, router));

  // Add sessionless authentication middleware
  // This handles things like HTTP basic, auth proxy, disable auth, and JWT service tokens
  // These attempt to authenticate the request based on information passed every request
  // They do not persist a session
  app.use(sessionlessAuth);

  const authRequiredRouters = [
    routeStatementResults,
    routeQueries,
    routeDrivers,
    routeUsers,
    routeConnections,
    routeConnectionAccesses,
    routeConnectionClients,
    routeConnectionSchema,
    routeTestConnection,
    routeQueryHistory,
    routeSchemaInfo,
    routeTags,
    routeFormatSql,
    routeServiceTokens,
    routeBatches,
    routeStatements,
  ];

  // Add all core routes to the baseUrl except for the */api/app route
  authRequiredRouters.forEach((router) => app.use(baseUrl, router));

  // Add '*/api/app' route last and without baseUrl
  app.use(routeApp);

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
    if (err && err.type === 'entity.too.large') {
      return res.status(413).json({
        title: 'Payload Too Large',
      });
    }
    return res.status(500).json({
      title: 'Internal Server Error',
    });
  });

  // Anything else should render the client-side app
  // Client-side routing will take care of things from here
  // Because index.html will be served via static plugin,
  // we need to rename it to something else and switch out the URLs to consider the baseUrl
  const indexPath = path.join(serverDirname, 'public/index.html');
  const indexTemplatePath = path.join(
    serverDirname,
    'public/index-template.html'
  );

  if (fs.existsSync(indexPath)) {
    fs.renameSync(indexPath, indexTemplatePath);
  }

  if (fs.existsSync(indexTemplatePath)) {
    const html = fs.readFileSync(indexTemplatePath, 'utf8');
    const baseUrlHtml = html
      .replace(/="\/assets/g, `="${baseUrl}/assets`)
      .replace(/="\/stylesheets/g, `="${baseUrl}/stylesheets`)
      .replace(/="\/javascripts/g, `="${baseUrl}/javascripts`)
      .replace(/="\/images/g, `="${baseUrl}/images`)
      .replace(/="\/favicon/g, `="${baseUrl}/favicon`)
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

export default makeApp;
