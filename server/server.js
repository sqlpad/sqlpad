#!/usr/bin/env node

const fs = require('fs');
const http = require('http');
const https = require('https');
const minimist = require('minimist');
const detectPort = require('detect-port');
const dotenv = require('dotenv');
const makeApp = require('./app');
const appLog = require('./lib/app-log');
const Config = require('./lib/config');
const { makeDb, getDb } = require('./lib/db');
const makeMigrator = require('./lib/make-migrator');
const loadSeedData = require('./lib/load-seed-data');
const ensureAdmin = require('./lib/ensure-admin');
const ensureConnectionAccess = require('./lib/ensure-connection-access');
const packageJson = require('./package.json');

const argv = minimist(process.argv.slice(2));

const helpText = `
  SQLPad version ${packageJson.version}

  # Print this help text
  node server.js --help

  # Apply database migrations then exit:
  node server.js --migrate --config path/to/file.format

  # Start SQLPad using config file:
  node server.js --config path/to/file.format
`;

function cliHas(value) {
  const lowered = argv._.map((v) => v.toLowerCase().trim());
  return lowered.includes(value);
}

if (argv.version || cliHas('version')) {
  // eslint-disable-next-line no-console
  console.log('SQLPad version %s', packageJson.version);
  process.exit(0);
}

if (argv.help || cliHas('help')) {
  // eslint-disable-next-line no-console
  console.log(helpText);
  process.exit(0);
}

// If an .env file was passed for config, call dotenv to apply it to process.env
// .env files are not processed like .ini/.json files
const configFilePath = argv.config || process.env.SQLPAD_CONFIG;
if (configFilePath && configFilePath.includes('.env')) {
  const result = dotenv.config({ path: configFilePath });
  if (result.error) {
    appLog.error(result.error, 'Error loading .env file');
    process.exit(1);
  }
}

const config = new Config(argv, process.env);

const migrateOnly = config.get('migrate') || cliHas('migrate');

appLog.setLevel(config.get('appLogLevel'));
appLog.debug(config.get(), 'Final config values');
appLog.debug(config.getConnections(), 'Connections from config');

// Validate configuration and warn/error as appropriate
const configValidations = config.getValidations();
configValidations.warnings.map((warning) => appLog.warn(warning));
if (configValidations.errors.length > 0) {
  configValidations.errors.forEach((error) => appLog.error(error));
  process.exit(1);
}

makeDb(config);

const baseUrl = config.get('baseUrl');
const ip = config.get('ip');
const port = config.get('port');
const httpsPort = config.get('port');
const certPassphrase = config.get('certPassphrase');
const keyPath = config.get('keyPath');
const certPath = config.get('certPath');
const systemdSocket = config.get('systemdSocket');
const timeoutSeconds = config.get('timeoutSeconds');

const HALF_HOUR = 1000 * 60 * 30;
const CLEANING_MS = HALF_HOUR + parseInt(Math.random() * HALF_HOUR * 2);

function isFdObject(ob) {
  return ob && typeof ob.fd === 'number';
}

// When --systemd-socket is passed we will try to acquire the bound socket
// directly from Systemd.
//
// More info
//
// https://github.com/rickbergfalk/sqlpad/pull/185
// https://www.freedesktop.org/software/systemd/man/systemd.socket.html
// https://www.freedesktop.org/software/systemd/man/sd_listen_fds.html
function detectPortOrSystemd(port) {
  if (systemdSocket) {
    const passedSocketCount = parseInt(process.env.LISTEN_FDS, 10) || 0;

    // LISTEN_FDS contains number of sockets passed by Systemd. At least one
    // must be passed. The sockets are set to file descriptors starting from 3.
    // We just crab the first socket from fd 3 since sqlpad binds only one
    // port.
    if (passedSocketCount > 0) {
      appLog.info('Using port from Systemd');
      return Promise.resolve({ fd: 3 });
    } else {
      appLog.warn(
        'Warning: Systemd socket asked but not found. Trying to bind port %d manually',
        port
      );
    }
  }

  return detectPort(port);
}

/*  Start the Server
============================================================================= */
let server;

async function startServer() {
  const { models, nedb, sequelizeDb } = await getDb();

  // Before application starts up apply any backend database migrations needed
  // If --migrate / migrate was specified, the process exits afterwards
  // Automatically running migrations may be disabled via config.
  const migrator = makeMigrator(config, appLog, nedb, sequelizeDb.sequelize);
  const isUpToDate = await migrator.schemaUpToDate();

  const runMigrations = migrateOnly || config.get('dbAutomigrate');

  if (!isUpToDate && !runMigrations) {
    appLog.error(
      'SQLPad schema not up to date. Turn on automigration or use --migrate'
    );
    process.exit(1);
  }

  if (runMigrations) {
    appLog.info('Running migrations');
    await migrator.migrate();
    appLog.info('Migration finished');
  }

  if (migrateOnly) {
    process.exit(0);
  }

  // Load seed data after migrations
  await loadSeedData(appLog, config, models);

  // Ensure admin is set if configured
  await ensureAdmin(models, config);

  // Create a connection accesses entry for everyone if set
  await ensureConnectionAccess(sequelizeDb, config);

  // Schedule cleanups
  setInterval(async () => {
    await models.statements.removeOldEntries();
  }, CLEANING_MS);

  // Create expressjs app
  const app = await makeApp(config, models);

  // determine if key pair exists for certs
  if (keyPath && certPath) {
    // https only
    const _port = await detectPortOrSystemd(httpsPort);
    if (!isFdObject(_port) && parseInt(httpsPort, 10) !== parseInt(_port, 10)) {
      appLog.info(
        'Port %d already occupied. Using port %d instead.',
        httpsPort,
        _port
      );
      // TODO FIXME XXX  Persist the new port to the in-memory store.
      // config.set('httpsPort', _port)
    }

    const privateKey = fs.readFileSync(keyPath, 'utf8');
    const certificate = fs.readFileSync(certPath, 'utf8');
    const httpsOptions = {
      key: privateKey,
      cert: certificate,
      passphrase: certPassphrase,
    };

    server = https
      .createServer(httpsOptions, app)
      .listen(_port, ip, function () {
        const hostIp = ip === '0.0.0.0' ? 'localhost' : ip;
        const url = `https://${hostIp}:${_port}${baseUrl}`;
        appLog.info('Welcome to SQLPad!. Visit %s to get started', url);
      });
  } else {
    // http only
    const _port = await detectPortOrSystemd(port);
    if (!isFdObject(_port) && parseInt(port, 10) !== parseInt(_port, 10)) {
      appLog.info(
        'Port %d already occupied. Using port %d instead.',
        port,
        _port
      );

      // TODO FIXME XXX  Persist the new port to the in-memory store.
      // config.set('port', _port)
    }
    server = http.createServer(app).listen(_port, ip, function () {
      const hostIp = ip === '0.0.0.0' ? 'localhost' : ip;
      const url = `http://${hostIp}:${_port}${baseUrl}`;
      appLog.info('Welcome to SQLPad! Visit %s to get started', url);
    });
  }
  server.setTimeout(timeoutSeconds * 1000);
}

startServer().catch((error) => {
  appLog.error(error, 'Error starting SQLPad');
  process.exit(1);
});

function handleShutdownSignal(signal) {
  if (!server) {
    appLog.info('Received %s, but no server to shutdown', signal);
    process.exit(0);
  } else {
    appLog.info('Received %s, shutting down server...', signal);
    server.close(function () {
      process.exit(0);
    });
  }
}

process.on('SIGTERM', handleShutdownSignal);
process.on('SIGINT', handleShutdownSignal);
