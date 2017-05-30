var SocksConnection = require('socksjs')

module.exports = function (connection) {
  if (connection.useSocks) {
    return new SocksConnection({
      host: connection.host,
      port: connection.port
    }, {
      host: connection.socksHost,
      port: connection.socksPort,
      user: connection.socksUsername,
      pass: connection.socksPassword
    })
  }
}
