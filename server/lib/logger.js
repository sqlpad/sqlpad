const config = require('./config');

// Log levels https://github.com/pinojs/pino/issues/123
const appLogLevel = config.get('appLogLevel');

const logger = require('pino')({
  name: 'sqlpad-app',
  level: appLogLevel
});

module.exports = logger;
