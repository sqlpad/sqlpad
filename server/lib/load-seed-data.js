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
      name => path.extname(name.toLowerCase()) === '.json'
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
    const data = { ...existing, ...query };
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
