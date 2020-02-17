const minimist = require('minimist');
const argv = minimist(process.argv.slice(2));
const logger = require('./logger');
const packageJson = require('../package.json');
const configItems = require('./config/configItems');

const keyLengths = configItems.map(item => item.key.length);
const keyPadding = Math.max(...keyLengths) + 2;

const helpText = `
SQLPad version:  ${packageJson.version}

CLI examples: 

  sqlpad --dbPath ../db --port 3010 --debug --baseUrl /sqlpad
  node server.js --dbPath ../db --port 3010 --debug --baseUrl /sqlpad
  node server.js --config path/to/file.json
  node server.js --config path/to/file.ini

Options:

${configItems
  .map(option => {
    return `  --${option.key.padEnd(keyPadding)}${option.description}\n`;
  })
  .join('')}`;

// If version is requested show version then exit
if (argv.v || argv.version) {
  logger.info('SQLPad version %s', packageJson.version);
  process.exit();
}

// If help is requested show help
if (argv.h || argv.help) {
  logger.info(helpText);
  process.exit();
}
