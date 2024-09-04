import '../typedefs.js';
import appLog from '../lib/app-log.js';
import express from 'express';
const router = express.Router();

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

export default router;
