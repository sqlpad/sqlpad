const fs = require('fs');
const ini = require('ini');
const configItems = require('./configItems');

/**
 * Reads and parses config file.
 * This file may be either JSON or INI file.
 * @param {string} configFilePath
 */
function fromFile(configFilePath) {
  let parsedFile = {};
  const warnings = [];

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

    // Validate that the config file uses the keys defined in configItems
    // Prior to SQLPad 3 the saved config file was a JSON result of what minimist parsed from argv
    // This means that there could be cliFlag's in the json ie `cert-passphrase` or `dir` for dbPath
    // These are no longer supported from a file
    Object.keys(parsedFile).forEach(key => {
      const configItem = configItems.find(item => item.key === key);
      if (!configItem) {
        let warningMessage = `Config key ${key} in file ${configFilePath} not recognized.`;

        // Find the item it might be and give the user a hint
        const maybeItem = configItems.find(item => {
          if (Array.isArray(item.cliFlag)) {
            return item.cliFlag.includes(key);
          }
          return item.cliFlag === key;
        });
        if (maybeItem) {
          warningMessage += ` Did you mean ${maybeItem.key}?`;
        } else {
          warningMessage += ' It can likely be removed.';
        }
        warnings.push(warningMessage);
      }
    });
  }

  return [parsedFile, warnings];
}

module.exports = fromFile;
