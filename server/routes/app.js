import '../typedefs.js';
import packageJson from '../server-package-json.cjs';
import wrap from '../lib/wrap.js';
import express from 'express';
const router = express.Router();

/**
 * @param {Req} req
 * @param {Res} res
 */
async function getApp(req, res) {
  const { config } = req;

  const currentUser =
    req.isAuthenticated() && req.user
      ? {
          id: req.user.id,
          email: req.user.email,
          role: req.user.role,
          name: req.user.name,
          ldapId: req.user.ldapId,
        }
      : undefined;

  return res.utils.data({
    currentUser,
    config: {
      allowCsvDownload: config.get('allowCsvDownload'),
      baseUrl: config.get('baseUrl'),
      defaultConnectionId: config.get('defaultConnectionId'),
      editorWordWrap: config.get('editorWordWrap'),
      googleAuthConfigured: Boolean(config.googleAuthConfigured()),
      localAuthConfigured: !config.get('userpassAuthDisabled'),
      publicUrl: config.get('publicUrl'),
      samlConfigured: Boolean(config.get('samlEntryPoint')),
      samlLinkHtml: config.get('samlLinkHtml'),
      ldapConfigured: config.get('ldapAuthEnabled'),
      ldapRolesConfigured: Boolean(
        config.get('ldapRoleAdminFilter') || config.get('ldapRoleEditorFilter')
      ),
      oidcConfigured: config.oidcConfigured(),
      oidcLinkHtml: config.get('oidcLinkHtml'),
      showServiceTokensUI: Boolean(config.get('serviceTokenSecret')),
    },
    version: packageJson.version,
  });
}

// NOTE: this route needs a wildcard because it is fetched as a relative url
// from the front-end. The static SPA does not know if sqlpad is mounted at
// the root of a domain or if there is a base-url provided in the config
router.get('*/api/app', wrap(getApp));

export default router;
