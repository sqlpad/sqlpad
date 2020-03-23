const router = require('express').Router();
const mustBeAdmin = require('../middleware/must-be-admin.js');
const sendError = require('../lib/send-error');

/**
 * @param {import('express').Request & Req} req
 * @param {*} res
 */
async function listServiceTokens(req, res) {
  const { models } = req;
  try {
    const serviceTokens = await models.serviceTokens.findAll();
    return res.json({ serviceTokens });
  } catch (error) {
    sendError(res, error, 'Problem getting service tokens');
  }
}

router.get('/api/service-tokens', mustBeAdmin, listServiceTokens);

/**
 * @param {import('express').Request & Req} req
 * @param {*} res
 */
async function generateServiceToken(req, res) {
  const { models } = req;
  try {
    let serviceToken = await models.serviceTokens.findOneByName(req.body.name);
    if (serviceToken) {
      return sendError(res, null, 'Service token already exists');
    }

    serviceToken = await models.serviceTokens.generate({
      name: req.body.name,
      role: req.body.role,
      duration: req.body.duration
    });

    return res.json({ serviceToken });
  } catch (error) {
    sendError(res, error);
  }
}

router.post('/api/service-tokens', mustBeAdmin, generateServiceToken);

/**
 * @param {import('express').Request & Req} req
 * @param {*} res
 */
async function deleteServiceToken(req, res) {
  const { models } = req;
  try {
    await models.serviceTokens.removeOneById(req.params._id);
    return res.json({});
  } catch (error) {
    sendError(res, error, 'Problem deleting service token');
  }
}

router.delete('/api/service-tokens/:_id', mustBeAdmin, deleteServiceToken);

module.exports = router;
