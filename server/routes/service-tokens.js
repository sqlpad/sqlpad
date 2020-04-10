const router = require('express').Router();
const mustBeAdmin = require('../middleware/must-be-admin.js');
const wrap = require('../lib/wrap');

/**
 * @param {import('express').Request & Req} req
 * @param {*} res
 */
async function listServiceTokens(req, res) {
  const { models } = req;
  const serviceTokens = await models.serviceTokens.findAll();
  return res.data(serviceTokens);
}

router.get('/api/service-tokens', mustBeAdmin, wrap(listServiceTokens));

/**
 * @param {import('express').Request & Req} req
 * @param {*} res
 */
async function generateServiceToken(req, res) {
  const { models } = req;

  let serviceToken = await models.serviceTokens.findOneByName(req.body.name);
  if (serviceToken) {
    return res.errors('Service token already exists', 400);
  }

  serviceToken = await models.serviceTokens.generate({
    name: req.body.name,
    role: req.body.role,
    duration: req.body.duration
  });

  return res.data(serviceToken);
}

router.post('/api/service-tokens', mustBeAdmin, wrap(generateServiceToken));

/**
 * @param {import('express').Request & Req} req
 * @param {*} res
 */
async function deleteServiceToken(req, res) {
  const { models } = req;
  await models.serviceTokens.removeOneById(req.params._id);
  return res.data(null);
}

router.delete(
  '/api/service-tokens/:_id',
  mustBeAdmin,
  wrap(deleteServiceToken)
);

module.exports = router;
