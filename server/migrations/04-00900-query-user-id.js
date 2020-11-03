/* eslint-disable no-await-in-loop */
const Sequelize = require('sequelize');
const _ = require('lodash');
const { v4: uuidv4 } = require('uuid');
const migrationUtils = require('../lib/migration-utils');

/**
 * @param {import('sequelize').QueryInterface} queryInterface
 * @param {import('../lib/config')} config
 * @param {import('../lib/logger')} appLog
 * @param {object} sequelizeDb - sequelize instance
 */
// eslint-disable-next-line no-unused-vars
async function up(queryInterface, config, appLog, sequelizeDb) {
  // Get distinct list of emails used for userids
  // Trim and lower case them
  // For each email, see if a user exists for it
  // If user does not exist, create a user record, disabled for that lower cased email
  const rows = await sequelizeDb.query(
    `
      SELECT DISTINCT created_by AS email FROM queries WHERE created_by IS NOT NULL
      UNION
      SELECT DISTINCT updated_by AS email FROM queries WHERE updated_by IS NOT NULL
      UNION 
      SELECT DISTINCT user_email AS email FROM query_acl WHERE user_email IS NOT NULL
    `,
    {
      type: Sequelize.QueryTypes.SELECT,
    }
  );

  // lowercase and trim emails
  let emails = rows.map((row) => {
    return (row.email || '').trim().toLowerCase();
  });
  emails = _.uniq(emails);

  const usersToCreate = [];

  for (const email of emails) {
    const existingUsers = await sequelizeDb.query(
      `SELECT id FROM users WHERE email = :email`,
      {
        replacements: { email },
        type: Sequelize.QueryTypes.SELECT,
      }
    );

    if (existingUsers.length === 0) {
      usersToCreate.push({
        id: uuidv4(),
        name: email.split('@')[0],
        email,
        role: 'editor',
        disabled: true,
        created_at: new Date(),
        updated_at: new Date(),
      });
    }
  }

  if (usersToCreate.length > 0) {
    await queryInterface.bulkInsert('users', usersToCreate);
  }

  // At this point get all users, and create a map converting email -> id
  // All email addresses in the system should map to some sort of user account
  let users = await sequelizeDb.query(`SELECT id, email FROM users`, {
    type: Sequelize.QueryTypes.SELECT,
  });

  const emailId = {};
  users.forEach((user) => {
    emailId[user.email] = user.id;
  });

  const transaction = await sequelizeDb.transaction();
  try {
    /**
     * Migrate created_by & updated_by for queries
     */
    const queries = await sequelizeDb.query(
      `SELECT id, created_by, updated_by FROM queries`,
      {
        type: Sequelize.QueryTypes.SELECT,
        transaction,
      }
    );

    for (const query of queries) {
      const replacements = {
        id: query.id,
        createdBy: emailId[query.created_by.trim().toLowerCase()],
        updatedBy: null,
      };
      if (query.updated_by) {
        replacements.updatedBy = emailId[query.updated_by.trim().toLowerCase()];
      }

      await sequelizeDb.query(
        `
          UPDATE queries 
          SET 
            created_by = :createdBy, 
            updated_by = :updatedBy 
          WHERE
            id = :id
        `,
        {
          type: Sequelize.QueryTypes.UPDATE,
          replacements,
          transaction,
        }
      );
    }

    /**
     * Migrate user_email for query_acl
     */
    const acls = await sequelizeDb.query(
      `
        SELECT id, user_id, user_email
        FROM query_acl
        WHERE user_email IS NOT NULL
      `,
      {
        type: Sequelize.QueryTypes.SELECT,
        transaction,
      }
    );

    for (const acl of acls) {
      const replacements = {
        id: acl.id,
        userId: emailId[acl.user_email.trim().toLowerCase()],
      };
      await sequelizeDb.query(
        `
          UPDATE query_acl 
          SET 
            user_id = :userId
          WHERE
            id = :id
        `,
        {
          type: Sequelize.QueryTypes.UPDATE,
          replacements,
          transaction,
        }
      );
    }

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }

  // Remove user_email column
  // Each DB behaves differently here.
  // These constraint/index removes are wrapped in try/catches and ignored to handle this.
  // MySQL needs this constraint removed and is fine otherwise
  // SQL Server needs the index dropped
  // SQLite has no clue. It seems to rebuild the table when a column is removed and indexes need to be added back
  try {
    await queryInterface.removeConstraint(
      'query_acl',
      'query_acl_user_email_query_id_key'
    );
  } catch (error) {
    // ignore error. constraint may not exist depending on backend database
  }
  try {
    await queryInterface.removeIndex(
      'query_acl',
      'query_acl_user_email_query_id_key'
    );
  } catch (error) {
    // ignore error. constraint may not exist depending on backend database
  }
  await queryInterface.removeColumn('query_acl', 'user_email');

  // For SQLite constraints appear to be lost when a column is removed.
  // Re-add the index if necessary
  await migrationUtils.addOrReplaceIndex(
    queryInterface,
    'query_acl',
    'query_acl_group_id_query_id_key',
    ['group_id', 'query_id'],
    {
      unique: true,
      where: {
        group_id: {
          [Sequelize.Op.ne]: null,
        },
      },
    }
  );

  await migrationUtils.addOrReplaceIndex(
    queryInterface,
    'query_acl',
    'query_acl_user_id_query_id_key',
    ['user_id', 'query_id'],
    {
      unique: true,
      where: {
        user_id: {
          [Sequelize.Op.ne]: null,
        },
      },
    }
  );
}

module.exports = {
  up,
};
