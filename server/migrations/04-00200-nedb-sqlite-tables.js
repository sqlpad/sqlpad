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
      type: Sequelize.TEXT,
      allowNull: false
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
      type: Sequelize.STRING,
      allowNull: false
    },
    // also email address
    updated_by: {
      type: Sequelize.STRING
    },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false
    },
    // Originally modifiedDate
    updated_at: {
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
        type: Sequelize.STRING,
        allowNull: false
      },
      tag: {
        type: Sequelize.STRING,
        allowNull: false
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
      type: Sequelize.STRING,
      allowNull: false
    },
    description: {
      type: Sequelize.TEXT
    },
    driver: {
      type: Sequelize.STRING,
      allowNull: false
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
      type: Sequelize.TEXT,
      allowNull: false
    },
    // Originally createdDate
    created_at: {
      type: Sequelize.DATE,
      allowNull: false
    },
    // Originally modifiedDate
    updated_at: {
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
      type: Sequelize.STRING,
      allowNull: false
    },
    connection_name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    user_id: {
      type: Sequelize.STRING,
      allowNull: false
    },
    user_email: {
      type: Sequelize.STRING,
      allowNull: false
    },
    duration: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    expiry_date: {
      type: Sequelize.DATE,
      allowNull: false
    },
    // Originally createdDate
    created_at: {
      type: Sequelize.DATE,
      allowNull: false
    },
    // Originally modifiedDate
    updated_at: {
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
      type: Sequelize.STRING,
      allowNull: false
    },
    connection_name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    user_id: {
      type: Sequelize.STRING,
      allowNull: false
    },
    user_email: {
      type: Sequelize.STRING,
      allowNull: false
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
      type: Sequelize.TEXT,
      allowNull: false
    },
    incomplete: {
      type: Sequelize.BOOLEAN
    },
    row_count: {
      type: Sequelize.INTEGER
    },
    // Originally createdDate
    created_at: {
      type: Sequelize.DATE,
      allowNull: false
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
  await queryInterface.createTable(
    'users',
    {
      id: {
        type: Sequelize.STRING,
        primaryKey: true
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false
      },
      role: {
        type: Sequelize.STRING,
        allowNull: false
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
        type: Sequelize.DATE,
        allowNull: false
      },
      // originally modifiedDate
      updated_at: {
        type: Sequelize.DATE
      }
    },
    {
      uniqueKeys: {
        users_email: {
          fields: ['email']
        },
        users_password_reset_id: {
          fields: ['password_reset_id']
        }
      }
    }
  );
}

module.exports = {
  up
};
