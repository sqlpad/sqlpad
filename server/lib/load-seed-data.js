/* eslint-disable no-await-in-loop */
const fs = require('fs');
const path = require('path');

function dirExists(path) {
  try {
    fs.accessSync(path);
    return true;
  } catch (error) {
    return false;
  }
}

async function getItemDirectoryData(appLog, seedDataPath, dir) {
  const items = [];

  const dirPath = path.join(seedDataPath, dir);
  if (dirExists(dirPath)) {
    const fileNames = fs.readdirSync(dirPath);
    const jsonFileNames = fileNames.filter(
      (name) => path.extname(name.toLowerCase()) === '.json'
    );
    for (const jsonFileName of jsonFileNames) {
      const filePath = path.join(dirPath, jsonFileName);
      const data = fs.readFileSync(filePath, 'utf8');
      try {
        const parsed = JSON.parse(data);
        items.push(parsed);
      } catch (error) {
        appLog.error(error, 'Error reading and parsing seed data %s', filePath);
      }
    }
  }

  return items;
}

/**
 * User references from seed data can be email or user id
 * This tries to find the user referenced, and creates a disabled user if one is not found
 * @param {import('../models')} models
 * @param {string} emailOrId
 */
async function findOrCreateUserReference(models, emailOrId) {
  let user = await models.users.findOneByEmail(emailOrId.toLowerCase());
  if (!user) {
    user = await models.users.findOneById(emailOrId);
  }

  // If user isn't found, we will add disabled user to reference
  if (!user) {
    user = await models.users.create({
      id: emailOrId.trim(),
      name: emailOrId.split('@')[0],
      email: emailOrId.toLowerCase().trim(),
      role: 'editor',
      disabled: true,
    });
  }
  return user;
}

/**
 * @param {*} appLog
 * @param {*} config
 * @param {import('../models')} models
 */
async function loadSeedData(appLog, config, models) {
  const seedDataPath = config.get('seedDataPath');

  const resolved = path.resolve(seedDataPath);
  appLog.info('Loading seed data from %s', resolved);

  if (!seedDataPath || !dirExists(seedDataPath)) {
    return;
  }

  const queries = await getItemDirectoryData(appLog, seedDataPath, 'queries');
  for (const query of queries) {
    const existing = await models.queries.findOneById(query.id);

    // Find actual createdBy user.
    // query.createdBy could be email or user id
    let createdByUser = await findOrCreateUserReference(
      models,
      query.createdBy
    );
    let updatedByUser = createdByUser;
    if (query.updatedBy) {
      updatedByUser = await findOrCreateUserReference(models, query.updatedBy);
    }

    if (query.acl) {
      for (const acl of query.acl) {
        let fieldCount = 0;
        if (acl.userId) {
          fieldCount += 1;
        }
        if (acl.userEmail) {
          fieldCount += 1;
        }
        if (acl.groupId) {
          fieldCount += 1;
        }
        if (fieldCount > 1) {
          throw new Error(
            'Query seed import - only specify one of userId, userEmail, or groupId'
          );
        }

        if (acl.userEmail) {
          const aclUser = await findOrCreateUserReference(
            models,
            acl.userEmail
          );
          delete acl.userEmail;
          acl.userId = aclUser.id;
        }
      }
    }

    const data = {
      ...existing,
      ...query,
      createdBy: createdByUser.id,
      updatedBy: updatedByUser.id,
    };

    // TODO - only update query if query data is different
    // Aways updating is causing updatedAt to change, which is bringing these results to the top of UI
    // This will require taking a subset of query data and performing a deep equal
    await models.upsertQuery(data);
  }

  const connections = await getItemDirectoryData(
    appLog,
    seedDataPath,
    'connections'
  );
  for (const connection of connections) {
    const existing = await models.connections.findOneById(connection.id);
    if (existing) {
      await models.connections.update(existing.id, connection);
    } else {
      await models.connections.create(connection);
    }
  }
}

module.exports = loadSeedData;
