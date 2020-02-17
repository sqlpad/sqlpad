const config = require('./config');

// Log levels https://github.com/pinojs/pino/issues/123
const logLevel = config.get('logLevel');
const logApp = config.get('logApp');
const debug = config.get('debug');

const logger = require('pino')({
  name: 'sqlpad-app',
  enabled: logApp,
  level: debug ? 'debug' : logLevel
});

module.exports = logger;
