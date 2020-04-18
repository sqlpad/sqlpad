const Sequelize = require('sequelize');
const migrationUtils = require('../lib/migration-utils');

/**
 * @param {import('sequelize').QueryInterface} queryInterface
 * @param {import('../lib/config')} config
 * @param {import('../lib/logger')} appLog
 * @param {object} nedb - collection of nedb objects created in /lib/db.js
 */
// eslint-disable-next-line no-unused-vars
async function up(queryInterface, config, appLog, nedb) {
  /**
   * QUERIES
   * ========================================================
   */
  await queryInterface.createTable('queries', {
    id: {
      type: Sequelize.STRING,
      primaryKey: true
    },
    name: {
      type: Sequelize.TEXT
    },
    connection_id: {
      type: Sequelize.STRING
    },
    query_text: {
      type: Sequelize.TEXT
    },
    // With addition of multiple queries per query...
    // unsure what direction charts will go.
    // Leaving this as a JSON object
    chart: {
      type: Sequelize.JSON
    },
    // email address
    // (possibly weird, but user ids may not be known ahead of time
    // email is human friendly too
    created_by: {
      type: Sequelize.STRING
    },
    modified_by: {
      type: Sequelize.STRING
    },
    created_at: {
      type: Sequelize.DATE
    },
    // Originally modifiedDate
    modified_at: {
      type: Sequelize.DATE
    },
    // Originally lastAccessDate
    last_accessed_at: {
      type: Sequelize.DATE
    }
  });

  await migrationUtils.addOrReplaceIndex(
    queryInterface,
    'queries',
    'queries_created_by',
    ['created_by']
  );

  await queryInterface.createTable(
    'query_tags',
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      query_id: {
        type: Sequelize.STRING
      },
      tag: {
        type: Sequelize.STRING
      }
    },
    {
      uniqueKeys: {
        query_tags_query_id_tag: {
          fields: ['query_id', 'tag']
        }
      }
    }
  );

  await migrationUtils.addOrReplaceIndex(
    queryInterface,
    'query_tags',
    'query_tags_tag',
    ['tag']
  );

  await migrationUtils.addOrReplaceIndex(
    queryInterface,
    'query_tags',
    'query_tags_tag',
    ['tag']
  );

  /**
   * CONNECTIONS
   * ========================================================
   */
  await queryInterface.createTable('connections', {
    id: {
      type: Sequelize.STRING,
      primaryKey: true
    },
    name: {
      type: Sequelize.STRING
    },
    description: {
      type: Sequelize.TEXT
    },
    driver: {
      type: Sequelize.STRING
    },
    multi_statement_transaction_enabled: {
      type: Sequelize.BOOLEAN
    },
    idle_timeout_seconds: {
      type: Sequelize.INTEGER
    },
    // Holds all driver-specific fields
    // It is encrypted JSON
    data: {
      type: Sequelize.TEXT
    },
    // Originally createdDate
    created_at: {
      type: Sequelize.DATE
    },
    // Originally modifiedDate
    modified_at: {
      type: Sequelize.DATE
    }
  });

  /**
   * CONNECTION ACCESSES
   * ========================================================
   */
  await queryInterface.createTable('connection_accesses', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    connection_id: {
      type: Sequelize.STRING
    },
    connection_name: {
      type: Sequelize.STRING
    },
    user_id: {
      type: Sequelize.STRING
    },
    user_email: {
      type: Sequelize.STRING
    },
    duration: {
      type: Sequelize.INTEGER
    },
    // Originally expiryDate
    expiry_at: {
      type: Sequelize.DATE
    },
    // Originally createdDate
    created_at: {
      type: Sequelize.DATE
    },
    // Originally modifiedDate
    modified_at: {
      type: Sequelize.DATE
    }
  });

  await migrationUtils.addOrReplaceIndex(
    queryInterface,
    'connection_accesses',
    'connection_accesses_connection_id',
    ['connection_id']
  );

  await migrationUtils.addOrReplaceIndex(
    queryInterface,
    'connection_accesses',
    'connection_accesses_user_id',
    ['user_id']
  );

  /**
   * QUERY HISTORY
   * ========================================================
   */
  await queryInterface.createTable('query_history', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    connection_id: {
      type: Sequelize.STRING
    },
    connection_name: {
      type: Sequelize.STRING
    },
    user_id: {
      type: Sequelize.STRING
    },
    user_email: {
      type: Sequelize.STRING
    },
    start_time: {
      type: Sequelize.DATE
    },
    stop_time: {
      type: Sequelize.DATE
    },
    query_run_time: {
      type: Sequelize.INTEGER
    },
    query_id: {
      type: Sequelize.STRING
    },
    query_name: {
      type: Sequelize.STRING
    },
    query_text: {
      type: Sequelize.TEXT
    },
    incomplete: {
      type: Sequelize.BOOLEAN
    },
    row_count: {
      type: Sequelize.INTEGER
    },
    // Originally createdDate
    created_at: {
      type: Sequelize.DATE
    }
  });

  await migrationUtils.addOrReplaceIndex(
    queryInterface,
    'query_history',
    'query_history_connection_name',
    ['connection_name']
  );

  await migrationUtils.addOrReplaceIndex(
    queryInterface,
    'query_history',
    'query_history_user_email',
    ['user_email']
  );

  await migrationUtils.addOrReplaceIndex(
    queryInterface,
    'query_history',
    'query_history_created_at',
    ['created_at']
  );

  /**
   * USERS
   * ========================================================
   */
  await queryInterface.createTable('users', {
    id: {
      type: Sequelize.STRING,
      primaryKey: true
    },
    email: {
      type: Sequelize.STRING
    },
    role: {
      type: Sequelize.STRING
    },
    name: {
      type: Sequelize.STRING
    },
    passhash: {
      type: Sequelize.STRING
    },
    password_reset_id: {
      type: Sequelize.UUID
    },
    data: {
      type: Sequelize.JSON
    },
    // Originally signupDate
    signup_at: {
      type: Sequelize.DATE
    },
    // Originally createdDate
    created_at: {
      type: Sequelize.DATE
    },
    // originally modifiedDate
    modified_at: {
      type: Sequelize.DATE
    }
  });

  await migrationUtils.addOrReplaceIndex(
    queryInterface,
    'users',
    'users_email',
    ['email']
  );
}

module.exports = {
  up
};
