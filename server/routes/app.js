const router = require('express').Router();
const packageJson = require('../package.json');
const getModels = require('../models');
const sendError = require('../lib/sendError');

// NOTE: this route needs a wildcard because it is fetched as a relative url
// from the front-end. The static SPA does not know if sqlpad is mounted at
// the root of a domain or if there is a base-url provided in the config
router.get('*/api/app', async (req, res) => {
  const { config, nedb } = req;
  try {
    const models = getModels(nedb);
    const adminRegistrationOpen = await models.users.adminRegistrationOpen();
    const currentUser =
      req.isAuthenticated() && req.user
        ? {
            _id: req.user.id,
            email: req.user.email,
            role: req.user.role
          }
        : undefined;

    return res.json({
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
  } catch (error) {
    sendError(res, error, 'Problem querying users');
  }
});

module.exports = router;
