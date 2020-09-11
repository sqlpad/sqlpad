require('../typedefs');
const router = require('express').Router();
const mustHaveConnectionAccess = require('../middleware/must-have-connection-access.js');
const ConnectionClient = require('../lib/connection-client');
const wrap = require('../lib/wrap');

/**
 * @param {Req} req
 * @param {Res} res
 */
async function getSchemaInfo(req, res) {
  const { models, user } = req;
  const { connectionId } = req.params;
  const reload = req.query.reload === 'true';

  const conn = await models.connections.findOneById(connectionId);

  if (!conn) {
    return res.utils.notFound();
  }

  const connectionClient = new ConnectionClient(conn, user);
  const schemaCacheId = connectionClient.getSchemaCacheId();

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

  // schemaInfo format returned from connectionClient changed since this route was originally implemented
  // It needs to change from this:
  // { schemas: [{ name, description, tables: [{ name, description, columns: [{ name, description, dataType }] }] }] }
  // to the following:
  /*
    {
      "schema-name": {
        "table-name": [
          {
            column_name: "the column name",
            data_type: "string"
            column_description: "an optional description"
          }
        ]
      }
    }
  */

  const oldFormat = {};
  if (schemaInfo.schemas) {
    schemaInfo.schemas.forEach((schema) => {
      oldFormat[schema.name] = {};
      if (schema.tables) {
        schema.tables.forEach((table) => {
          oldFormat[schema.name][table.name] = [];
          if (table.columns) {
            table.columns.forEach((column) => {
              oldFormat[schema.name][table.name].push({
                column_name: column.name,
                data_type: column.dataType,
                column_description: column.description,
              });
            });
          }
        });
      }
    });
  }

  if (Object.keys(oldFormat).length) {
    await models.schemaInfo.saveSchemaInfo(schemaCacheId, oldFormat);
  }
  return res.utils.data(oldFormat);
}

router.get(
  '/api/schema-info/:connectionId',
  mustHaveConnectionAccess,
  wrap(getSchemaInfo)
);

module.exports = router;
