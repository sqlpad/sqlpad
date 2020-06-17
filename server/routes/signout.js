require('../typedefs');
const router = require('express').Router();
const appLog = require('../lib/app-log');

/**
 * Clear out session regardless of auth strategy
 * @param {Req} req
 * @param {Res} res
 */
function handleSignout(req, res) {
  if (!req.session) {
    return res.utils.data('signout', {});
  }
  req.session.destroy(function (err) {
    if (err) {
      appLog.error(err);
    }
    res.utils.data('signout', {});
  });
}

router.get('/api/signout', handleSignout);

module.exports = router;
