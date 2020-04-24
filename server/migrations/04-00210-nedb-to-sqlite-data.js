const _ = require('lodash');
const Cryptr = require('cryptr');
const makeCipher = require('../lib/make-cipher');

// NOTE: This migration should *ONLY* do data transport from nedb to sqlite
// At some point nedb will be removed from repo and this migration will be removed

/**
 * @param {import('sequelize').QueryInterface} queryInterface
 * @param {import('../lib/config')} config
 * @param {import('../lib/logger')} appLog
 * @param {object} nedb - collection of nedb objects created in /lib/db.js
 */
// eslint-disable-next-line no-unused-vars
async function up(queryInterface, config, appLog, nedb) {
  /**
   * Clear tables in case of previous run failure
   *
   * On first run this is unnecessary,
   * as the tables are guaranteed to be empty.
   * However, if migration fails, it will not roll back the work
   * performed. We are not writing .down() methods and taking
   * a forward-only approach to migrations.
   * ========================================================
   */
  await queryInterface.bulkDelete('query_tags', {});
  await queryInterface.bulkDelete('queries', {});
  await queryInterface.bulkDelete('connections', {});
  await queryInterface.bulkDelete('connection_accesses', {});
  await queryInterface.bulkDelete('query_history', {});
  await queryInterface.bulkDelete('users', {});

  /**
   * QUERIES
   * ========================================================
   */
  const queries = await nedb.queries.find({});

  const queriesData = [];
  const queryTagsData = [];

  queries.forEach(originalQuery => {
    const newQuery = {
      id: originalQuery._id,
      name: originalQuery.name,
      connection_id: originalQuery.connectionId,
      query_text: originalQuery.queryText,
      chart: JSON.stringify(originalQuery.chartConfiguration),
      created_by: originalQuery.createdBy,
      updated_by: originalQuery.modifiedBy,
      created_at: originalQuery.createdDate,
      updated_at: originalQuery.modifiedDate,
      last_accessed_at: originalQuery.lastAccessDate
    };
    queriesData.push(newQuery);

    if (originalQuery.tags && originalQuery.tags.length) {
      const tags = _.uniq(originalQuery.tags).sort();
      tags.forEach(tag => {
        queryTagsData.push({ query_id: originalQuery._id, tag });
      });
    }
  });

  if (queriesData.length) {
    await queryInterface.bulkInsert('queries', queriesData);
  }
  if (queryTagsData.length) {
    await queryInterface.bulkInsert('query_tags', queryTagsData);
  }

  /**
   * CONNECTIONS
   * ========================================================
   */
  const originalConnections = await nedb.connections.find({});

  const connectionData = originalConnections.map(original => {
    const {
      name,
      driver,
      createdDate,
      modifiedDate,
      multiStatementTransactionEnabled,
      idleTimeoutSeconds,
      _id,
      ...rest
    } = original;

    // Migrate to better encrypted db details
    // Decrypt username/password using old deprecated method
    // Encrypt all user-provided connection info with cryptr
    const oldCipher = makeCipher(config.get('passphrase'));
    if (rest.username) {
      rest.username = oldCipher.decipher(rest.username);
    }
    if (rest.password) {
      rest.password = oldCipher.decipher(rest.password);
    }
    const cryptr = new Cryptr(config.get('passphrase'));
    const encryptedData = cryptr.encrypt(JSON.stringify(rest));

    return {
      id: _id,
      name,
      driver,
      multi_statement_transaction_enabled: multiStatementTransactionEnabled,
      idle_timeout_seconds: idleTimeoutSeconds,
      data: encryptedData,
      created_at: createdDate ? new Date(createdDate) : new Date(),
      updated_at: modifiedDate ? new Date(modifiedDate) : new Date()
    };
  });

  if (connectionData.length) {
    await queryInterface.bulkInsert('connections', connectionData);
  }

  /**
   * CONNECTION ACCESSES
   * ========================================================
   */

  const originalConnectionAccesses = await nedb.connectionAccesses.find({});

  const connectionAccessData = originalConnectionAccesses.map(original => {
    return {
      connection_id: original.connectionId,
      connection_name: original.connectionName,
      user_id: original.userId,
      user_email: original.userEmail,
      duration: original.duration || 0,
      expiry_date: new Date(original.expiryDate),
      created_at: original.createdDate
        ? new Date(original.createdDate)
        : new Date(),
      updated_at: original.modifiedDate ? new Date(original.modifiedDate) : null
    };
  });

  if (connectionAccessData.length) {
    await queryInterface.bulkInsert(
      'connection_accesses',
      connectionAccessData
    );
  }

  /**
   * QUERY HISTORY
   * ========================================================
   */
  const originalHistory = await nedb.queryHistory.find({});

  const historyData = originalHistory.map(original => {
    return {
      user_id: original.userId,
      user_email: original.userEmail,
      connection_id: original.connectionId,
      connection_name: original.connectionName,
      start_time: original.startTime,
      stop_time: original.stopTime,
      query_run_time: original.queryRunTime,
      query_id: original.queryId || null,
      query_name: original.queryName,
      query_text: original.queryText,
      incomplete: original.incomplete,
      row_count: original.rowCount,
      created_at: original.createdDate
    };
  });

  if (historyData.length) {
    await queryInterface.bulkInsert('query_history', historyData);
  }

  /**
   * USERS
   * ========================================================
   */
  const originalUsers = await nedb.users.find({});

  const userData = originalUsers.map(original => {
    return {
      id: original._id,
      email: original.email,
      name: original.name,
      role: original.role,
      password_reset_id: original.passwordResetId,
      passhash: original.passhash,
      data: JSON.stringify(original.data),
      signup_at: original.signupDate ? new Date(original.signupDate) : null,
      created_at: new Date(original.createdDate),
      updated_at: original.modifiedDate ? new Date(original.modifiedDate) : null
    };
  });

  if (userData.length) {
    await queryInterface.bulkInsert('users', userData);
  }
}

module.exports = {
  up
};
