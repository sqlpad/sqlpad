import Sequelize from 'sequelize';
import url from 'url';

/**
 * @param {import('sequelize').QueryInterface} queryInterface
 * @param {import('../lib/config')} config
 * @param {import('../lib/logger')} appLog
 * @param {object} sequelizeDb - sequelize instance
 */
// eslint-disable-next-line no-unused-vars
export async function up(queryInterface, config, appLog, sequelizeDb) {
  const backendDatabaseUri = config.get('backendDatabaseUri');
  const urlParts = url.parse(backendDatabaseUri);
  const dialect = backendDatabaseUri
    ? urlParts.protocol.replace(/:$/, '')
    : 'sqlite';
  if (dialect === 'postgres') {
    try {
      const query =
        'ALTER TABLE "service_tokens" ALTER COLUMN "id" TYPE VARCHAR(255);';
      await sequelizeDb.query(query);
    } catch (error) {
      appLog.error(
        error,
        `Error alter id column from integer to string under postgres`
      );
    }
  } else if (dialect === 'mssql') {
    try {
      // find primary key constraint
      const query =
        'select name  FROM SYS.OBJECTS ' +
        "WHERE TYPE_DESC = 'PRIMARY_KEY_CONSTRAINT' " +
        "and PARENT_OBJECT_ID = OBJECT_ID('service_tokens', 'U');";
      const PKConstraint = await sequelizeDb.query(query, {
        type: sequelizeDb.QueryTypes.SELECT,
      });
      // drop primary key constraint if exists
      if (PKConstraint.length > 0) {
        const dropPKQuery = `ALTER TABLE service_tokens DROP CONSTRAINT ${PKConstraint[0].name};`;
        await sequelizeDb.query(dropPKQuery);
      }
      // drop id column because identification column must be int-like type when chagne column under mssql
      const dropIdQuery = 'ALTER TABLE service_tokens DROP COLUMN id';
      await sequelizeDb.query(dropIdQuery);
      // add id column
      await queryInterface.addColumn('service_tokens', 'id', {
        type: Sequelize.STRING,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      });
    } catch (error) {
      appLog.error(
        error,
        `Error alter id column from integer to string under mssql`
      );
    }
  } else {
    try {
      // alter id column from integer to string
      await queryInterface.changeColumn('service_tokens', 'id', {
        type: Sequelize.STRING,
        defaultValue: Sequelize.UUIDV4,
      });
    } catch (error) {
      appLog.error(error, `Error alter id column from integer to string`);
    }
  }
}

export default {
  up,
};
