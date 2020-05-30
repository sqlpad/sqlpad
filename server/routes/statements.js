require('../typedefs');
const router = require('express').Router();
const mustBeAuthenticated = require('../middleware/must-be-authenticated.js');
const wrap = require('../lib/wrap');

/**
 * Get statement by id.
 * Only batches created by that user are permitted.
 * Eventually this may need to expand to basing this on whether user has access to that query and/or connection
 * @param {Req} req
 * @param {Res} res
 */
async function getStatement(req, res) {
  const { models, user, params } = req;
  const statement = await models.statements.findOneById(params.statementId);

  if (!statement) {
    return res.utils.notFound();
  }

  // Get batch to ensure it was created by User.
  // This is not the most efficient since it gets statements again
  // Need to maybe rethink these models functions
  const batch = await models.batches.findOneById(statement.batchId);

  if (batch.userId !== user.id) {
    return res.utils.forbidden();
  }

  return res.utils.data(statement);
}

router.get(
  '/api/statements/:statementId',
  mustBeAuthenticated,
  wrap(getStatement)
);

/**
 * Get  statement results
 * Only statement from batch created by that user are permitted.
 * Eventually this may need to expand to basing this on whether user has access to that query and/or connection
 * @param {Req} req
 * @param {Res} res
 */
async function getStatementResults(req, res) {
  const { models, user, params } = req;
  const statement = await models.statements.findOneById(params.statementId);

  if (!statement) {
    return res.utils.notFound();
  }

  // Get batch to ensure it was created by User.
  // This is not the most efficient since it gets statements again
  // Need to maybe rethink these models functions
  const batch = await models.batches.findOneById(statement.batchId);

  if (batch.userId !== user.id) {
    return res.utils.forbidden();
  }

  const rows = await models.statements.getStatementResults(statement.id);
  return res.utils.data(rows);
}

router.get(
  '/api/statements/:statementId/results',
  mustBeAuthenticated,
  wrap(getStatementResults)
);

module.exports = router;
