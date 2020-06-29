const passport = require('passport');
const BasicStrategy = require('passport-http').BasicStrategy;
const appLog = require('../lib/app-log');
const passhash = require('../lib/passhash.js');

function enableBasic(config) {
  if (config.get('disableUserpassAuth')) {
    return;
  }

  appLog.info('Enabling basic authentication strategy.');
  passport.use(
    new BasicStrategy(
      {
        passReqToCallback: true,
      },
      async function (req, username, password, callback) {
        try {
          const { models } = req;
          const user = await models.users.findOneByEmail(username);
          if (!user) {
            return callback(null, false);
          }
          if (user.disabled) {
            return callback(null, false);
          }
          const isMatch = await passhash.comparePassword(
            password,
            user.passhash
          );
          if (!isMatch) {
            return callback(null, false);
          }
          return callback(null, user);
        } catch (error) {
          callback(error);
        }
      }
    )
  );
}

module.exports = enableBasic;
