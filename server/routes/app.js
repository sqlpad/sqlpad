require('../typedefs');
const router = require('express').Router();
const packageJson = require('../package.json');
const wrap = require('../lib/wrap');

/**
 * @param {Req} req
 * @param {Res} res
 */
async function getApp(req, res) {
  const { config, models } = req;
  const adminRegistrationOpen = await models.users.adminRegistrationOpen();
  const currentUser =
    req.isAuthenticated() && req.user
      ? {
          id: req.user.id,
          email: req.user.email,
          role: req.user.role,
        }
      : undefined;

  return res.utils.data({
    adminRegistrationOpen,
    currentUser,
    config: {
      allowCsvDownload: config.get('allowCsvDownload'),
      baseUrl: config.get('baseUrl'),
      defaultConnectionId: config.get('defaultConnectionId'),
      editorWordWrap: config.get('editorWordWrap'),
      googleAuthConfigured: config.googleAuthConfigured(),
      localAuthConfigured: !(
        config.get('userpassAuthDisabled') || config.get('disableUserpassAuth')
      ),
      publicUrl: config.get('publicUrl'),
      samlConfigured: Boolean(
        config.get('samlEntryPoint') || config.get('samlEntryPoint_d')
      ),
      samlLinkHtml: config.get('samlLinkHtml') || config.get('samlLinkHtml_d'),
      smtpConfigured: config.smtpConfigured(),
      ldapConfigured: config.get('enableLdapAuth'),
      oidcConfigured: config.oidcConfigured(),
      oidcLinkHtml: config.get('oidcLinkHtml'),
    },
    version: packageJson.version,
  });
}

// NOTE: this route needs a wildcard because it is fetched as a relative url
// from the front-end. The static SPA does not know if sqlpad is mounted at
// the root of a domain or if there is a base-url provided in the config
router.get('*/api/app', wrap(getApp));

module.exports = router;
