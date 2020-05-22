require('../typedefs');
const router = require('express').Router();
const mustBeAuthenticated = require('../middleware/must-be-authenticated.js');
const executeBatch = require('../lib/execute-batch');
const wrap = require('../lib/wrap');

/**
 * List batches.
 * Restricted to batches for the currently logged in user
 * @param {Req} req
 * @param {Res} res
 */
async function list(req, res) {
  const { models, user } = req;
  const batches = await models.batches.findAllForUser(user);
  return res.utils.data(batches);
}

router.get('/api/batches', mustBeAuthenticated, wrap(list));

/**
 * Get batch by id.
 * Only batches created by that user are permitted.
 * Eventually this may need to expand to basing this on whether user has access to that query and/or connection
 * @param {Req} req
 * @param {Res} res
 */
async function get(req, res) {
  const { models, user, params } = req;
  const batch = await models.batches.findOneById(params.id);

  if (!batch) {
    return res.utils.notFound();
  }

  if (batch.userId !== user.id) {
    return res.utils.forbidden();
  }

  return res.utils.data(batch);
}

router.get('/api/batches/:id', mustBeAuthenticated, wrap(get));

/**
 * Create batch
 * @param {Req} req
 * @param {Res} res
 */
async function create(req, res) {
  const { models, body, user, appLog } = req;
  const {
    queryId,
    name,
    connectionId,
    connectionClientId,
    batchText,
    selectedText,
    chart,
  } = body;

  const batch = {
    queryId,
    name,
    connectionId,
    connectionClientId,
    batchText,
    selectedText,
    chart,
    userId: user.id,
  };

  const newBatch = await models.batches.create(batch);

  // Run batch, but don't wait for it to send response
  // Client will get status via polling or perhaps some future event mechanism
  executeBatch(models, newBatch.id).catch((error) => appLog.error(error));

  return res.utils.data(newBatch);
}

router.post('/api/batches', mustBeAuthenticated, wrap(create));

module.exports = router;
