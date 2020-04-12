const router = require('express').Router();
const mustBeAdmin = require('../middleware/must-be-admin.js');
const wrap = require('../lib/wrap');

/**
 * @param {Req} req
 * @param {Res} res
 */
async function listServiceTokens(req, res) {
  const { models } = req;
  const serviceTokens = await models.serviceTokens.findAll();
  return res.utils.data(serviceTokens);
}

router.get('/api/service-tokens', mustBeAdmin, wrap(listServiceTokens));

/**
 * @param {Req} req
 * @param {Res} res
 */
async function generateServiceToken(req, res) {
  const { models, config } = req;

  if (!config.get('serviceTokenSecret')) {
    return res.utils.forbidden();
  }

  let serviceToken = await models.serviceTokens.findOneByName(req.body.name);
  if (serviceToken) {
    return res.utils.errors('Service token already exists', 400);
  }

  serviceToken = await models.serviceTokens.generate({
    name: req.body.name,
    role: req.body.role,
    duration: req.body.duration
  });

  return res.utils.data(serviceToken);
}

router.post('/api/service-tokens', mustBeAdmin, wrap(generateServiceToken));

/**
 * @param {Req} req
 * @param {Res} res
 */
async function deleteServiceToken(req, res) {
  const { models } = req;
  await models.serviceTokens.removeOneById(req.params._id);
  return res.utils.deleteOk();
}

router.delete(
  '/api/service-tokens/:_id',
  mustBeAdmin,
  wrap(deleteServiceToken)
);

module.exports = router;
