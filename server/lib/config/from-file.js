const fs = require('fs');
const path = require('path');
const ini = require('ini');
const appLog = require('../app-log');

/**
 * Reads and parses config file.
 * This file may be either JSON or INI file.
 * @param {string} configFilePath
 */
function fromFile(configFilePath) {
  let parsedFile = {};

  if (!configFilePath) {
    return {};
  }

  if (typeof configFilePath !== 'string') {
    throw new Error('Config file must be string');
  }

  if (!fs.existsSync(configFilePath)) {
    throw new Error(`Config file ${configFilePath} not found`);
  }

  const fileText = fs.readFileSync(configFilePath, { encoding: 'utf8' });
  const extname = path.extname(configFilePath).toLowerCase();

  try {
    if (configFilePath.includes('.env')) {
      // Return an empty object.
      // .env is applied to process.env and therefore processed with environment variables
      return {};
    } else if (extname === '.json') {
      parsedFile = JSON.parse(fileText);
    } else if (extname === '.ini') {
      parsedFile = ini.parse(fileText);
    } else {
      // If the extension isn't known attempt to parse as JSON
      // (Old default file .sqlpadrc was stored as JSON)
      // Log a deprecation message that specific file extension will be required in future
      // TODO remove this in v6
      appLog.warn(`Unknown file extension for ${configFilePath}`);
      appLog.warn(`File will be parsed as JSON.`);
      appLog.warn(`Future SQLPad release will require known file extensions`);
      parsedFile = JSON.parse(fileText);
    }
  } catch (error) {
    appLog.error(error, `Error parsing file ${configFilePath}`);
    throw new Error(`Error parsing config file ${configFilePath}`);
  }

  return parsedFile;
}

module.exports = fromFile;
