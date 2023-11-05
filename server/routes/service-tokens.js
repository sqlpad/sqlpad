import '../typedefs.js';
import mustBeAdmin from '../middleware/must-be-admin.js';
import wrap from '../lib/wrap.js';
import express from 'express';
const router = express.Router();

/**
 * @param {Req} req
 * @param {Res} res
 */
async function listServiceTokens(req, res) {
  const { models } = req;
  const serviceTokens = await models.serviceTokens.findAll();
  return res.utils.data(serviceTokens);
}

/**
 * @param {Req} req
 * @param {Res} res
 */
async function generateServiceToken(req, res) {
  const { models, config } = req;

  const secret = config.get('serviceTokenSecret');
  if (!secret) {
    return res.utils.forbidden();
  }

  let serviceToken = await models.serviceTokens.findOneByName(req.body.name);
  if (serviceToken) {
    return res.utils.error('Service token already exists');
  }

  serviceToken = await models.serviceTokens.generate({
    name: req.body.name,
    role: req.body.role,
    duration: req.body.duration,
  });

  return res.utils.data(serviceToken);
}

/**
 * @param {Req} req
 * @param {Res} res
 */
async function deleteServiceToken(req, res) {
  const { models } = req;
  await models.serviceTokens.removeOneById(req.params.id);
  return res.utils.data();
}

router.get('/api/service-tokens', mustBeAdmin, wrap(listServiceTokens));
router.post('/api/service-tokens', mustBeAdmin, wrap(generateServiceToken));
router.delete('/api/service-tokens/:id', mustBeAdmin, wrap(deleteServiceToken));

export default router;
