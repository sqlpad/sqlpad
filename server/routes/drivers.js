import '../typedefs.js';
import mustBeAuthenticated from '../middleware/must-be-authenticated.js';
import drivers from '../drivers/index.js';
import express from 'express';
const router = express.Router();

/**
 * @param {Req} req
 * @param {Res} res
 */
function getDrivers(req, res) {
  const driversArray = Object.keys(drivers).map((id) => {
    const supportsConnectionClient = Boolean(drivers[id].Client);
    return {
      id,
      name: drivers[id].name,
      fields: drivers[id].fields,
      supportsConnectionClient,
    };
  });
  return res.utils.data(driversArray);
}

router.get('/api/drivers', mustBeAuthenticated, getDrivers);

export default router;
