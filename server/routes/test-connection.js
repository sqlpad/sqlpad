import '../typedefs.js';
import mustBeAdmin from '../middleware/must-be-admin.js';
import wrap from '../lib/wrap.js';
import ConnectionClient from '../lib/connection-client.js';
import express from 'express';
const router = express.Router();

/**
 * A non-error response is considered a success or valid connection config
 * @param {Req} req
 * @param {Res} res
 */
async function testConnection(req, res) {
  const connectionClient = new ConnectionClient(
    { ...req.body, maxRows: 1 },
    req.user
  );
  // testConnection will throw if configuration is invalid
  // This is expected
  // An assumption is made that this is due to user-input error
  // TODO - separate connection config error from internal server error
  try {
    await connectionClient.testConnection();
    res.utils.data();
  } catch (error) {
    res.utils.error(error);
  }
}

router.post('/api/test-connection', mustBeAdmin, wrap(testConnection));

export default router;
