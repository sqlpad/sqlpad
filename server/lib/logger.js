const config = require('./config');

// Log levels https://github.com/pinojs/pino/issues/123
const logLevel = config.get('logLevel');

const logger = require('pino')({
  name: 'sqlpad-app',
  enabled: true, // TODO turn off for testing?
  level: logLevel // default 'info' // or debug
});

module.exports = logger;
