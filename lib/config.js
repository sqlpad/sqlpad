var path = require('path');
var fs = require('fs');
var rc = require('rc');
var userHome = (process.platform === "win32" ? process.env.USERPROFILE : process.env.HOME );
var configFilePath = path.join(userHome, '.sqlpadrc');

// $HOME/.sqlpad/config
// $HOME/.sqlpad/db
//var configFile = path.join(userHome, '.sqlpad/config');
var config = rc('sqlpad', {
    ip: process.env.SQLPAD_IP || "0.0.0.0",
    port: process.env.SQLPAD_PORT || 80,
    dbPath: path.join(userHome, "sqlpad/db"),
    passphrase: process.env.SQLPAD_PASSPHRASE || "At least the sensitive bits won't be plain text?"
});

// support --db and --dir for database directories
config.dbPath = config.db || config.dir || config.dbPath;
// resolve dbPath in case it needs it
config.dbPath = path.resolve(config.dbPath);

// Config file plans
// if config.save then save the config to a file
// if config.forget then remove the config file and exit
if (config.save) {
    console.log("Saving your configuration.");
    console.log("Next time just run 'sqlpad' and this config will be loaded.");
    var configForFile = {
        port: config.port, 
        dbPath: config.dbPath, 
        passphrase: config.passphrase
    };
    fs.writeFileSync(configFilePath, JSON.stringify(configForFile, null, 2));
}
if (config.forget) {
    if (fs.existsSync(configFilePath)) {
        fs.unlinkSync(configFilePath);
        console.log("Previous configuration removed.");
    } else {
        console.log("No previous configuration saved. Maybe it was a different user?");
    }
    console.log("Now exiting...");
    process.exit();
}

if (config.h || config.help) {
    var helpText = "\n" 
                 + "SqlPad Help: \n"
                 + " \n"
                 + "Usage: sqlpad [options]\n"
                 + " \n"
                 + "Options: \n"
                 + " \n"
                 + "  --passphrase [phrase]   Passphrase for modest encryption  (recommended)\n"
                 + "                          environment variable: SQLPAD_PASSPHRASE\n"
                 + "  --dir [path]            Data directory (optional. Default is $HOME/sqlpad/db\n"
                 + "  --ip [ip]               IP address to bind to (optional. Default is all IPs, i.e 0.0.0.0)\n"
                 + "  --port [port]           Port to run on (optional. Default is 80)\n"
                 + "                          environment variable: SQLPAD_PORT\n"
                 + "  --debug                 Enable extra console logging\n"
                 + "  --save                  Saves above parameters to a file so you don't\n"
                 + "                          need to keep typing them in. No need to remember!\n"
                 + "  --forget                Forget the parameters you previously saved.\n"
                 + " \n"
                 + "Example: \n"
                 + " \n"
                 + "  sqlpad --dir ./SqlpadData --ip 127.0.0.1 --port 3000 --passphrase secr3t\n"
                 + " \n";
                     
    console.log(helpText);
    process.exit();
}

module.exports = config;
