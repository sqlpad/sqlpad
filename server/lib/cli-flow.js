const fs = require('fs');
const path = require('path');
const minimist = require('minimist');
const argv = minimist(process.argv.slice(2));
const packageJson = require('../package.json');
const userHome =
  process.platform === 'win32' ? process.env.USERPROFILE : process.env.HOME;
const savedCliFilePath = path.join(userHome, '.sqlpadrc');

const helpText = `

SQLPad Help:

Usage: sqlpad [options]

Options: 

  --passphrase [phrase]   Passphrase for modest encryption
                            optional, default: *******
                            environment var: SQLPAD_PASSPHRASE
  --dir [path]            Data directory 
                            optional, default: $HOME/sqlpad/db
                            environment var: SQLPAD_DB_PATH
  --ip [ip]               IP address to bind to
                            optional, default: 0.0.0.0 (all IPs)
                            environment var: SQLPAD_IP
  --port [port]           Port to run on 
                            optional, default: 80
                            environment var: SQLPAD_PORT
  --base-url [path]       Base url to mount sqlpad routes to 
                            optional, default: ''
                            environment var: SQLPAD_BASE_URL
  --admin [emailaddress]  Whitelist/add admin permission to email provided.
                            optional, default: ''
                            environment var: SQLPAD_ADMIN
  --debug                 Enable extra console logging
                            optional, default: false
                            environment var: SQLPAD_DEBUG (set to TRUE)

  --save                  Saves above parameters to file for future use.
  --forget                Forget parameters previously saved.

  See configuration management page in-application for 
  additional settings and further documentation.

Example: 

  sqlpad --dir ./sqlpaddata --ip 127.0.0.1 --port 3000 --passphrase secr3t

`;

// If version is requested show version then exit
if (argv.v || argv.version) {
  console.log('SQLPad version ' + packageJson.version);
  process.exit();
}

// If help is requested show help
if (argv.h || argv.help) {
  console.log(helpText);
  process.exit();
}

// if --save was passed in via cli, we should save the cli args
// this file is a simple key/value object where key is the config item key
if (argv.save) {
  console.log('Saving your configuration.');
  console.log("Next time just run 'sqlpad' and this config will be loaded.");
  fs.writeFileSync(savedCliFilePath, JSON.stringify(argv, null, 2));
}

// if --forget was passed in via cli we should remove the saved cli args file
if (argv.forget) {
  if (fs.existsSync(savedCliFilePath)) {
    fs.unlinkSync(savedCliFilePath);
    console.log('Previous configuration removed.');
  } else {
    console.log(
      'No previous configuration saved. Maybe it was a different user?'
    );
  }
  console.log('Exiting...');
  process.exit();
}
