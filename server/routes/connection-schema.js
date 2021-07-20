require('../typedefs');
const compression = require('compression');
const router = require('express').Router();
const mustHaveConnectionAccess = require('../middleware/must-have-connection-access');
const ConnectionClient = require('../lib/connection-client');
const wrap = require('../lib/wrap');

/**
 * @param {Req} req
 * @param {Res} res
 */
async function getConnectionSchema(req, res) {
  const { models, user } = req;
  const { connectionId } = req.params;
  const reload = req.query.reload === 'true';

  const conn = await models.connections.findOneById(connectionId);

  if (!conn) {
    return res.utils.notFound();
  }

  const connectionClient = new ConnectionClient(conn, user);
  const schemaCacheId = connectionClient.getSchemaCacheId(2);

  let schemaInfo = await models.schemaInfo.getSchemaInfo(schemaCacheId);

  if (schemaInfo && !reload) {
    return res.utils.data(schemaInfo);
  }

  try {
    schemaInfo = await connectionClient.getSchema();
  } catch (error) {
    // Assumption is that error is due to user configuration
    // letting it bubble up results in 500, but it should be 400
    return res.utils.error(error);
  }

  if (Object.keys(schemaInfo).length) {
    await models.schemaInfo.saveSchemaInfo(schemaCacheId, schemaInfo);
  }
  return res.utils.data(schemaInfo);
}

// compression is added here becasue a big database server can have huge amount
// of metadata and since this is not retrieved schema by schema 20mb+ would easily be possible in plain/text
// on slow connections where a LB does not compress this can be a big bottleneck.
// better would be to expand this router to provide:
// - '/api/connections/:connectionId/schema_names' to get all schema names
// - '/api/connections/:connectionId/schema/:schemaName' to get tables of a schema
// - '/api/connections/:connectionId/schema/:schemaName/:tableName' to get column information of a schema table
// and then deprecate the current '/api/connections/:connectionId/schema'
router.get(
  '/api/connections/:connectionId/schema',
  compression(),
  mustHaveConnectionAccess,
  wrap(getConnectionSchema)
);

module.exports = router;
