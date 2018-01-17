const utils = require('../utils')

const expectedKeys = [
  'adminRegistrationOpen',
  'config',
  'smtpConfigured',
  'googleAuthConfigured',
  'version',
  'passport'
]

const { spawn } = require('child_process')
const ls = spawn('node', [
  'server.js',
  '--dir',
  './dbtest',
  '--port',
  '3010',
  '--debug'
])

ls.stdout.on('data', data => {
  console.log(`stdout: ${data}`)
})

ls.stderr.on('data', data => {
  console.log(`stderr: ${data}`)
})

ls.on('close', code => {
  console.log(`child process exited with code ${code}`)
})

setTimeout(function() {
  describe('api/app', function() {
    describe('get', function() {
      it('returns expected values', function() {
        return utils.get('/api/app').then(data => {
          utils.expectKeys(data, expectedKeys)
        })
      })

      it('handles unknown baseUrl', function() {
        return utils.get('/sqlpad/api/app').then(data => {
          utils.expectKeys(data, expectedKeys)
        })
      })
    })
  })
}, 4000)
