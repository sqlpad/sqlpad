const router = require('express').Router();
const version = require('../lib/version.js');
const User = require('../models/User.js');
const sendError = require('../lib/sendError');
const config = require('../lib/config');

// NOTE: this route needs a wildcard because it is fetched as a relative url
// from the front-end. The static SPA does not know if sqlpad is mounted at
// the root of a domain or if there is a base-url provided in the config
router.get('*/api/app', async (req, res) => {
  try {
    const adminRegistrationOpen = await User.adminRegistrationOpen();
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
      version: version.get()
    });
  } catch (error) {
    sendError(res, error, 'Problem querying users');
  }
});

module.exports = router;
