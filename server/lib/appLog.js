const Logger = require('./logger');
const config = require('./config');

const appLogLevel = config.get('appLogLevel');

const appLog = new Logger(appLogLevel);

module.exports = appLog;
