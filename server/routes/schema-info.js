const router = require('express').Router();
const mustHaveConnectionAccess = require('../middleware/must-have-connection-access.js');
const sendError = require('../lib/sendError');
const DriverConnection = require('../lib/driver-connection');

router.get(
  '/api/schema-info/:connectionId',
  mustHaveConnectionAccess,
  async function(req, res) {
    const { models, user } = req;
    const { connectionId } = req.params;
    const reload = req.query.reload === 'true';

    try {
      const conn = await models.connections.findOneById(connectionId);

      if (!conn) {
        throw new Error('Connection not found');
      }

      let schemaInfo = await models.schemaInfo.getSchemaInfo(connectionId);

      if (schemaInfo && !reload) {
        return res.json({ schemaInfo });
      }

      const driverConnection = new DriverConnection(conn, user);
      schemaInfo = await driverConnection.getSchema();
      if (Object.keys(schemaInfo).length) {
        await models.schemaInfo.saveSchemaInfo(connectionId, schemaInfo);
      }
      return res.json({ schemaInfo });
    } catch (error) {
      if (error.message === 'Connection not found') {
        return sendError(res, error);
      }
      sendError(res, error, 'Problem getting schema info');
    }
  }
);

module.exports = router;
