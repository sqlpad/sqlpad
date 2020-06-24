const appLog = require('../lib/app-log');
const validate = require('./validate');

const drivers = {
  bigquery: require('./bigquery'),
  cassandra: require('./cassandra'),
  crate: require('./crate'),
  drill: require('./drill'),
  hdb: require('./hdb'),
  mysql: require('./mysql'),
  mysql2: require('./mysql2'),
  postgres: require('./postgres'),
  presto: require('./presto'),
  clickhouse: require('./clickhouse'),
  redshift: require('./redshift'),
  snowflake: require('./snowflake'),
  sqlite: require('./sqlite'),
  sqlserver: require('./sqlserver'),
  vertica: require('./vertica'),
};

// unixodbc is an optional dependency due to it needing to be compiled
// (and lacks prebuilt binaries like sqlite provides)
try {
  drivers.unixodbc = require('./unixodbc');
} catch (error) {
  appLog.info('ODBC driver not available');
}

// Validate each driver implementation to ensure it matches expectations
Object.keys(drivers).forEach((id) => {
  const driver = drivers[id];
  validate(id, driver);
});

module.exports = drivers;
