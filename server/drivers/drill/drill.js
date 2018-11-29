/*
Copyright 2017 Charles S. Givre

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
const fetch = require('node-fetch')
var request = require('request')
var url = require('url')

exports.version = '1.0'

var Client = (exports.Client = function(args) {
  if (!args) args = {}

  this.host = args.host || 'localhost'
  this.port = args.port || 8047
  this.user = args.user || process.env.USER
  this.ssl = args.ssl || false
  this.protocol = 'http'
  if (this.ssl) {
    this.protocol = 'https'
  }
})

Client.prototype.execute = function(queryString, callback) {
  const href = url.format({
    protocol: this.protocol,
    hostname: 'localhost',
    pathname: '/query.json',
    port: 8047
  })
  let headers = {
    'Content-Type': 'application/json; charset=UTF-8',
    Accept: 'application/json'
  }
  let queryOptions = {
    uri: href,
    method: 'POST',
    headers: headers,
    json: { queryType: 'SQL', query: queryString }
  }
  request(queryOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      callback(null, body)
    } //TODO Add error handling
  })
}

Client.prototype.getSchemata = function() {
  return this.query('SHOW DATABASES')
}

Client.prototype.query = function(config, query) {
  const headers = {
    'Content-Type': 'application/json; charset=UTF-8',
    Accept: 'application/json'
  }
  const restURL =
    this.protocol + '://' + this.host + ':' + this.port + '/query.json'
  const queryInfo = {
    queryType: 'SQL',
    query: query
  }
  const body = JSON.stringify(queryInfo)
  return fetch(restURL, {
    method: 'POST',
    headers: headers,
    body: body
  })
    .then(function(data) {
      return data.json()
    })
    .then(function(jsonData) {
      return jsonData
    })
    .catch(function(e) {
      //TODO Send error message to JSON
      console.log('There was a problem with the request' + e)
      return e
    })
}

module.exports = { Client }
