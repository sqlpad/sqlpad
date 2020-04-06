const fs = require('fs');
const ini = require('ini');

/**
 * Reads and parses config file.
 * This file may be either JSON or INI file.
 * @param {string} configFilePath
 */
function fromFile(configFilePath) {
  let parsedFile = {};

  if (fs.existsSync(configFilePath)) {
    const fileText = fs.readFileSync(configFilePath, { encoding: 'utf8' });

    try {
      parsedFile = JSON.parse(fileText);
    } catch (error) {
      try {
        parsedFile = ini.parse(fileText);
      } catch (error) {
        throw new Error(`Error parsing config file ${configFilePath}`);
      }
    }
  }

  return parsedFile;
}

module.exports = fromFile;
