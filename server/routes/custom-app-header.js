const mustache = require('mustache');
const fs = require('fs');
const router = require('express').Router();
const appLog = require('../lib/appLog');

/**
 * Adds custom app header route if configured with path to template file
 * @param {object} config
 */
function getAppHeaderRouter(config) {
  const appHeaderTemplate = config.get('appHeaderTemplate');

  if (appHeaderTemplate) {
    appLog.info('Adding custom app header');

    let template;

    try {
      appLog.debug('Reading template file %s', appHeaderTemplate);
      template = fs.readFileSync(appHeaderTemplate, 'utf8');
    } catch (error) {
      appLog.error(error, 'Error reading app header template');
    }

    router.get('/custom-app-header', function(req, res) {
      const view = {
        user: {
          email: req.user.email,
          name: req.user.name || req.user.email,
          role: req.user.role,
          data: req.user.data
        }
      };

      const htmlResult = mustache.render(template, view);
      res.send(htmlResult);
    });
  }

  return router;
}

module.exports = getAppHeaderRouter;
