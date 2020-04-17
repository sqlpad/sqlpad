const router = require('express').Router();
const packageJson = require('../package.json');
const sendError = require('../lib/send-error');

// NOTE: this route needs a wildcard because it is fetched as a relative url
// from the front-end. The static SPA does not know if sqlpad is mounted at
// the root of a domain or if there is a base-url provided in the config
router.get('*/api/app', async (req, res) => {
  const { config, models } = req;
  try {
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
        allowCsvDownload: config.get('allowCsvDownload'),
        baseUrl: config.get('baseUrl'),
        defaultConnectionId: config.get('defaultConnectionId'),
        editorWordWrap: config.get('editorWordWrap'),
        googleAuthConfigured: config.googleAuthConfigured(),
        localAuthConfigured: !config.get('disableUserpassAuth'),
        publicUrl: config.get('publicUrl'),
        samlConfigured: Boolean(config.get('samlEntryPoint')),
        smtpConfigured: config.smtpConfigured()
      },
      version: packageJson.version
    });
  } catch (error) {
    sendError(res, error, 'Problem querying users');
  }
});

module.exports = router;
