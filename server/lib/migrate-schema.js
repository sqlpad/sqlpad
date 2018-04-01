const fs = require('fs')
const path = require('path')
const rimraf = require('rimraf')
const { dbPath, debug } = require('../lib/config').getPreDbConfig()
const schemaVersionFilePath = path.join(dbPath + '/schemaVersion.json')

// migrations must increment by 1
const migrations = {
  1: db =>
    // from now on, user.createdDate is when the user record was createdDate
    // instead of when the user signed up
    // user.signupDate should be used when user is initially signed up.
    // NOTE: using db directly here to avoid model schema conflicts
    // and extra model logic (like modified date updates)
    db.users.find({}).then(docs => {
      return Promise.all(
        docs.map(doc => {
          doc.signupDate = doc.createdDate
          doc.createdDate = doc.createdDate || new Date()
          doc.modifiedDate = doc.modifiedDate || new Date()
          return db.users.update({ _id: doc._id }, doc, {})
        })
      )
    }),
  2: db =>
    new Promise((resolve, reject) => {
      // reset cache because it wasn't being cleaned up properly before
      // first remove all the cache files
      // then remove the cache db records
      rimraf(path.join(dbPath, '/cache/*'), err => {
        if (err) {
          console.error(err)
          return reject(err)
        }
        db.cache
          .remove({}, { multi: true })
          .then(() => resolve())
          .catch(error => {
            console.error(error)
            return reject(error)
          })
      })
    }),
  3: db =>
    // change admin flag to role to allow for future viewer role
    // NOTE: using db directly here to avoid model schema conflicts
    // and extra model logic (like modified date updates)
    db.users.find({}).then(docs => {
      return Promise.all(
        docs.map(doc => {
          if (doc.admin) {
            doc.role = 'admin'
          } else {
            doc.role = 'editor'
          }
          return db.users.update({ _id: doc._id }, doc, {})
        })
      )
    })
}

/**
 * Run migrations until latest version
 * @param {*} db
 * @param {*} currentVersion
 * @returns {Promise}
 */
function runMigrations(db, currentVersion) {
  return new Promise((resolve, reject) => {
    const nextVersion = currentVersion + 1

    if (!migrations[nextVersion]) {
      return resolve()
    }

    if (debug) {
      console.log('Migrating schema to v%d', nextVersion)
    }
    migrations[nextVersion](db)
      .then(() => {
        // write new schemaVersion file
        const json = JSON.stringify({ schemaVersion: nextVersion })
        fs.writeFile(schemaVersionFilePath, json, err => {
          if (err) {
            return reject(err)
          }
          resolve(runMigrations(db, nextVersion))
        })
      })
      .catch(reject)
  })
}

/**
 * Run migrations if necessary
 * @param {db} db
 * @returns {Promise}
 */
module.exports = function migrateSchema(db) {
  return new Promise((resolve, reject) => {
    fs.readFile(schemaVersionFilePath, 'utf8', (err, json) => {
      if (err && err.code !== 'ENOENT') {
        return reject(err)
      }

      const currentVersion = json ? JSON.parse(json).schemaVersion : 0

      const latestVersion = Object.keys(migrations).reduce((prev, next) =>
        Math.max(prev, next)
      )

      if (currentVersion === latestVersion) {
        if (debug) {
          console.log('Schema is up to date (v%d).', latestVersion)
        }
        return resolve()
      }

      resolve(runMigrations(db, currentVersion))
    })
  })
}
