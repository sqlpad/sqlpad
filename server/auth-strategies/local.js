import passport from 'passport';
import { Strategy as PassportLocalStrategy } from 'passport-local';
import appLog from '../lib/app-log.js';
import passhash from '../lib/passhash.js';

function enableLocal(config) {
  if (config.get('userpassAuthDisabled')) {
    return;
  }

  appLog.info('Enabling local authentication strategy.');
  passport.use(
    new PassportLocalStrategy(
      {
        passReqToCallback: true,
        usernameField: 'email',
      },
      async function passportLocalStrategyHandler(req, email, password, done) {
        try {
          const { models } = req;
          const user = await models.users.findOneByEmail(email);
          if (!user) {
            return done(null, false, { message: 'wrong email or password' });
          }
          if (user.disabled) {
            return done(null, false);
          }
          const isMatch = await passhash.comparePassword(
            password,
            user.passhash
          );
          if (isMatch) {
            return done(null, {
              id: user.id,
              role: user.role,
              email: user.email,
            });
          }
          return done(null, false, { message: 'wrong email or password' });
        } catch (error) {
          done(error);
        }
      }
    )
  );
}

export default enableLocal;
