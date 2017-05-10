var fs = require('fs')
var path = require('path')
var minimist = require('minimist')
var argv = minimist(process.argv.slice(2))
var packageJson = require('../package.json')
var userHome = (process.platform === 'win32' ? process.env.USERPROFILE : process.env.HOME)
var savedCliFilePath = path.join(userHome, '.sqlpadrc')

// If version is requested show version then exit
if (argv.v || argv.version) {
  console.log('SQLPad version ' + packageJson.version)
  process.exit()
}

// if --save was passed in via cli, we should save the cli args
// this file is a simple key/value object where key is the config item key
if (argv.save) {
  console.log('Saving your configuration.')
  console.log('Next time just run \'sqlpad\' and this config will be loaded.')
  fs.writeFileSync(savedCliFilePath, JSON.stringify(argv, null, 2))
}

// if --forget was passed in via cli we should remove the saved cli args file
if (argv.forget) {
  if (fs.existsSync(savedCliFilePath)) {
    fs.unlinkSync(savedCliFilePath)
    console.log('Previous configuration removed.')
  } else {
    console.log('No previous configuration saved. Maybe it was a different user?')
  }
  console.log('Exiting...')
  process.exit()
}

// If help is requested show help
if (argv.h || argv.help) {
  var helpText = fs.readFileSync(path.join(__dirname, '/../resources/help.txt'), {encoding: 'utf8'})
  console.log(helpText)
  process.exit()
}
