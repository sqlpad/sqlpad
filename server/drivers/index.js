import appLog from '../lib/app-log.js';
import validate from './validate.js';
import athena from './athena/index.js';
import bigquery from './bigquery/index.js';
import cassandra from './cassandra/index.js';
import clickhouse from './clickhouse/index.js';
import crate from './crate/index.js';
import drill from './drill/index.js';
import hdb from './hdb/index.js';
import mysql from './mysql/index.js';
import mysql2 from './mysql2/index.js';
import pinot from './pinot/index.js';
import postgres from './postgres/index.js';
import presto from './presto/index.js';
import redshift from './redshift/index.js';
import sqlite from './sqlite/index.js';
import sqlserver from './sqlserver/index.js';
import trino from './trino/index.js';
import vertica from './vertica/index.js';

const drivers = {
  athena,
  bigquery,
  cassandra,
  clickhouse,
  crate,
  drill,
  hdb,
  mysql,
  mysql2,
  pinot,
  postgres,
  presto,
  redshift,
  sqlite,
  sqlserver,
  trino,
  vertica,
};

export const initDrivers = async () => {
  // unixodbc is an optional dependency due to it needing to be compiled
  // (and lacks prebuilt binaries like sqlite provides)
  try {
    appLog.info('Loading odbc');
    drivers.unixodbc = await import('./unixodbc/index.cjs').then(
      (module) => module.default
    );
    appLog.info('Loaded odbc');
  } catch (error) {
    appLog.info('ODBC driver not available');
  }
};

// Validate each driver implementation to ensure it matches expectations
Object.keys(drivers).forEach((id) => {
  const driver = drivers[id];
  validate(id, driver);
});

export default drivers;
