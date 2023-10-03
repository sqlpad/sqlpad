const appLog = require('../lib/app-log');
const validate = require('./validate');

const drivers = {
  athena: require('./athena'),
  bigquery: require('./bigquery'),
  cassandra: require('./cassandra'),
  clickhouse: require('./clickhouse'),
  crate: require('./crate'),
  drill: require('./drill'),
  hdb: require('./hdb'),
  mysql: require('./mysql'),
  mysql2: require('./mysql2'),
  pinot: require('./pinot'),
  postgres: require('./postgres'),
  presto: require('./presto'),
  redshift: require('./redshift'),
  sqlite: require('./sqlite'),
  sqlserver: require('./sqlserver'),
  trino: require('./trino'),
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
