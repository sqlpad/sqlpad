const appLog = require('../lib/appLog');
const validate = require('./validate');

const drivers = {
  cassandra: require('./cassandra'),
  crate: require('./crate'),
  drill: require('./drill'),
  hdb: require('./hdb'),
  mock: require('./mock'),
  mysql: require('./mysql'),
  postgres: require('./postgres'),
  presto: require('./presto'),
  snowflake: require('./snowflake'),
  sqlite: require('./sqlite'),
  sqlserver: require('./sqlserver'),
  vertica: require('./vertica')
};

// unixodbc is an optional dependency due to it needing to be compiled
// (and lacks prebuilt binaries like sqlite provides)
try {
  drivers.unixodbc = require('./unixodbc');
} catch (error) {
  appLog.info('ODBC driver not available');
}

// Validate each driver implementation to ensure it matches expectations
Object.keys(drivers).forEach(id => {
  const driver = drivers[id];
  validate(id, driver);
});

module.exports = drivers;
