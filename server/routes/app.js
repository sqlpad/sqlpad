const router = require('express').Router();
const packageJson = require('../package.json');
const wrap = require('../lib/wrap');

// NOTE: this route needs a wildcard because it is fetched as a relative url
// from the front-end. The static SPA does not know if sqlpad is mounted at
// the root of a domain or if there is a base-url provided in the config
router.get(
  '*/api/app',
  wrap(async (req, res) => {
    const { config, models } = req;
    const adminRegistrationOpen = await models.users.adminRegistrationOpen();
    const currentUser =
      req.isAuthenticated() && req.user
        ? {
            id: req.user.id,
            email: req.user.email,
            role: req.user.role
          }
        : undefined;

    return res.utils.data({
      adminRegistrationOpen,
      currentUser,
      config: {
        publicUrl: config.get('publicUrl'),
        allowCsvDownload: config.get('allowCsvDownload'),
        editorWordWrap: config.get('editorWordWrap'),
        baseUrl: config.get('baseUrl'),
        smtpConfigured: config.smtpConfigured(),
        googleAuthConfigured: config.googleAuthConfigured(),
        localAuthConfigured: !config.get('disableUserpassAuth'),
        samlConfigured: Boolean(config.get('samlEntryPoint'))
      },
      version: packageJson.version
    });
  })
);

module.exports = router;
