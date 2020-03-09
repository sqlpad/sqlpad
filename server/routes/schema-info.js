require('../typedefs');
const router = require('express').Router();
const mustHaveConnectionAccess = require('../middleware/must-have-connection-access.js');
const sendError = require('../lib/sendError');
const ConnectionClient = require('../lib/connection-client');

/**
 * @param {import('express').Request & Req} req
 * @param {*} res
 */
async function getSchemaInfo(req, res) {
  const { models, user } = req;
  const { connectionId } = req.params;
  const reload = req.query.reload === 'true';

  try {
    const conn = await models.connections.findOneById(connectionId);

    if (!conn) {
      throw new Error('Connection not found');
    }

    const connectionClient = new ConnectionClient(conn, user);
    const schemaCacheId = connectionClient.getSchemaCacheId();

    let schemaInfo = await models.schemaInfo.getSchemaInfo(schemaCacheId);

    if (schemaInfo && !reload) {
      return res.json({ schemaInfo });
    }

    schemaInfo = await connectionClient.getSchema();
    if (Object.keys(schemaInfo).length) {
      await models.schemaInfo.saveSchemaInfo(schemaCacheId, schemaInfo);
    }
    return res.json({ schemaInfo });
  } catch (error) {
    if (error.message === 'Connection not found') {
      return sendError(res, error);
    }
    sendError(res, error, 'Problem getting schema info');
  }
}

router.get(
  '/api/schema-info/:connectionId',
  mustHaveConnectionAccess,
  getSchemaInfo
);

module.exports = router;
