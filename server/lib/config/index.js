const fromDefault = require('./fromDefault');
const fromEnv = require('./fromEnv');
const fromCli = require('./fromCli');
const fromFile = require('./fromFile');
const getOldConfigWarning = require('./getOldConfigWarning');

class Config {
  constructor(argv) {
    this.argv = argv;

    const defaultConfig = fromDefault();
    const envConfig = fromEnv();
    const [fileConfig, warnings] = fromFile();
    const cliConfig = fromCli(argv);

    const all = { ...defaultConfig, ...envConfig, ...fileConfig, ...cliConfig };

    // Clean string boolean values
    Object.keys(all).forEach(key => {
      const value = all[key];
      if (typeof value === 'string') {
        if (value.trim().toLowerCase() === 'true') {
          all[key] = true;
        } else if (value.trim().toLowerCase() === 'false') {
          all[key] = false;
        }
      }
    });

    this.warnings = warnings;
    this.all = all;
  }

  get(key) {
    if (!key) {
      throw new Error('key must be provided');
    }

    if (!this.all.hasOwnProperty(key)) {
      throw new Error(`config item ${key} not defined in configItems.js`);
    }

    return this.all[key];
  }

  logDebugInfo(appLog) {
    appLog.debug(this.all, 'Final config values');
  }

  getValidations() {
    const errors = [];

    // By default dbPath will exist as empty string, which is not valid
    if (this.all.dbPath === '') {
      errors.push(getOldConfigWarning());
    }

    return {
      errors,
      warnings: [...this.warnings]
    };
  }

  smtpConfigured() {
    return (
      this.all.smtpHost &&
      this.all.smtpUser &&
      this.all.smtpFrom &&
      this.all.smtpPort &&
      this.all.publicUrl
    );
  }

  googleAuthConfigured() {
    return (
      this.all.publicUrl &&
      this.all.googleClientId &&
      this.all.googleClientSecret
    );
  }
}

module.exports = Config;
