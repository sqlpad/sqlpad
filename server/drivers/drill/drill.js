const fetch = require('node-fetch');
const appLog = require('../../lib/app-log');

exports.version = '1.0';

let Client = (exports.Client = function (args) {
  if (!args) args = {};

  this.host = args.host || 'localhost';
  this.port = args.port || 8047;
  this.user = args.user || process.env.USER;
  this.ssl = args.ssl || false;
  this.protocol = 'http';
  if (this.ssl) {
    this.protocol = 'https';
  }
});

Client.prototype.getSchemata = function () {
  return this.query('SHOW DATABASES');
};

Client.prototype.query = function (config, query) {
  const headers = {
    'Content-Type': 'application/json; charset=UTF-8',
    Accept: 'application/json',
  };
  const restURL =
    this.protocol + '://' + this.host + ':' + this.port + '/query.json';
  const queryInfo = {
    queryType: 'SQL',
    query,
  };
  const body = JSON.stringify(queryInfo);
  return fetch(restURL, {
    method: 'POST',
    headers,
    body,
  })
    .then(function (data) {
      return data.json();
    })
    .then(function (jsonData) {
      return jsonData;
    })
    .catch(function (e) {
      // TODO Send error message to JSON
      appLog.error(e);
      return e;
    });
};

module.exports = { Client };
