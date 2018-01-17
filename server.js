#!/usr/bin/env node

const fs = require('fs')
const http = require('http')
const https = require('https')
const detectPort = require('detect-port')

// Parse command line flags to see if anything special needs to happen
require('./lib/cli-flow.js')

const app = require('./app')
const config = require('./lib/config')
const db = require('./lib/db')

const BASE_URL = config.get('baseUrl')
const IP = config.get('ip')
const PORT = config.get('port')
const HTTPS_PORT = config.get('httpsPort')
const CERT_PASSPHRASE = config.get('certPassphrase')
const KEY_PATH = config.get('keyPath')
const CERT_PATH = config.get('certPath')
const SYSTEMD_SOCKET = config.get('systemdSocket')

function isFdObject(ob) {
  return ob && typeof ob.fd === 'number'
}

// When --systemd-socket is passed we will try to acquire the bound socket
// directly from Systemd.
//
// More info
//
// https://github.com/rickbergfalk/sqlpad/pull/185
// https://www.freedesktop.org/software/systemd/man/systemd.socket.html
// https://www.freedesktop.org/software/systemd/man/sd_listen_fds.html
function detectPortOrSystemd(port) {
  if (SYSTEMD_SOCKET) {
    const passedSocketCount = parseInt(process.env.LISTEN_FDS, 10) || 0

    // LISTEN_FDS contains number of sockets passed by Systemd. At least one
    // must be passed. The sockets are set to file descriptors starting from 3.
    // We just crab the first socket from fd 3 since sqlpad binds only one
    // port.
    if (passedSocketCount > 0) {
      console.log('Using port from Systemd')
      return Promise.resolve({ fd: 3 })
    } else {
      console.error(
        'Warning: Systemd socket asked but not found. Trying to bind port ' +
          port +
          ' manually'
      )
    }
  }

  return detectPort(port)
}

/*  Start the Server
============================================================================= */
db.onLoad(function(err) {
  if (err) throw err

  // determine if key pair exists for certs
  if (KEY_PATH && CERT_PATH) {
    // https only
    console.log('Launching server with SSL')
    detectPortOrSystemd(HTTPS_PORT).then(function(_port) {
      if (!isFdObject(_port) && HTTPS_PORT !== _port) {
        console.log(
          '\nPort %d already occupied. Using port %d instead.',
          HTTPS_PORT,
          _port
        )
        // Persist the new port to the in-memory store. This is kinda hacky
        // Assign value to cliValue since it overrides all other values
        const ConfigItem = require('./models/ConfigItem.js')
        const portConfigItem = ConfigItem.findOneByKey('httpsPort')
        portConfigItem.cliValue = _port
        portConfigItem.computeEffectiveValue()
      }

      const privateKey = fs.readFileSync(KEY_PATH, 'utf8')
      const certificate = fs.readFileSync(CERT_PATH, 'utf8')
      const httpsOptions = {
        key: privateKey,
        cert: certificate,
        passphrase: CERT_PASSPHRASE
      }

      https.createServer(httpsOptions, app).listen(_port, IP, function() {
        console.log(
          '\nWelcome to ' +
            app.locals.title +
            '!. Visit https://' +
            (IP === '0.0.0.0' ? 'localhost' : IP) +
            ':' +
            _port +
            BASE_URL +
            ' to get started'
        )
      })
    })
  } else {
    // http only
    console.log('Launching server WITHOUT SSL')
    detectPortOrSystemd(PORT).then(function(_port) {
      if (!isFdObject(_port) && PORT !== _port) {
        console.log(
          '\nPort %d already occupied. Using port %d instead.',
          PORT,
          _port
        )
        // Persist the new port to the in-memory store. This is kinda hacky
        // Assign value to cliValue since it overrides all other values
        const ConfigItem = require('./models/ConfigItem.js')
        const portConfigItem = ConfigItem.findOneByKey('port')
        portConfigItem.cliValue = _port
        portConfigItem.computeEffectiveValue()
      }
      http.createServer(app).listen(_port, IP, function() {
        console.log(
          '\nWelcome to ' +
            app.locals.title +
            '!. Visit http://' +
            (IP === '0.0.0.0' ? 'localhost' : IP) +
            ':' +
            _port +
            BASE_URL +
            ' to get started'
        )
      })
    })
  }
})
