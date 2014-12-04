var path = require('path');
var rc = require('rc');
var userHome = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;

module.exports = function (app) {
    
    // $HOME/.sqlpad/config
    // $HOME/.sqlpad/db
    //var configFile = path.join(userHome, '.sqlpad/config');
    var config = rc('sqlpad', {
        port: 80,
        dbPath: path.join(userHome, "sqlpad/db"),
        passphrase: "At least the sensitive bits won't be plain text?"
    });
    
    // support --db and --dir for database directories
    config.dbPath = config.db || config.dir || config.dbPath;
    // resolve dbPath in case it needs it
    config.dbPath = path.resolve(config.dbPath);
    
    config.config = config.config || path.join(userHome, '.sqlpad/config');
    
    if (config.h || config.help) {
        var helpText = "\n\n" 
                     + "SQLPAD HELP: \n"
                     + " \n"
                     + "USAGE: sqlpad [options]\n"
                     + " \n"
                     + "OPTIONS: \n"
                     + " \n"
                     + "  --passphrase [phrase]  Set passphrase for modest encryption  (recommended)\n"
                     + "  --db [path]            Set data directory                    (optional)\n"
                     + "  --admin [email]        Whitelist an administrator email      (req. 1st run)\n"
                     + "  --port [port]          Set port to run on. Default is 80     (optional)\n"
                     + "  \n"
                     + "EXAMPLES:  \n"
                     + "  \n"
                     + "  First Run: whitelist email address. Set encryption passphrase. \n"
                     + "  Leave port and db path at default. \n"
                     + "  \n"
                     + "      sqlpad --admin me@mycompany.com --passphrase s3cr3t-phr@se \n"
                     + "  \n"
                     + "  Future runs: just set encryption passphrase\n"
                     + "  \n"
                     + "      sqlpad --passphrase s3cr3t-phr@se \n"
                     + "  \n"
                     + "  To set db folder, either use a relative path to current location...\n"
                     + "  \n"
                     + "      sqlpad --db ./db/folder/ \n"
                     + "  \n"
                     + "  ... or use an exact path\n"
                     + "  \n"
                     + "      sqlpad --db c:\\squeegeedb \n"
                     + "  \n";
                     
        console.log(helpText);
        process.exit();
    }
    
    if (config.hasOwnProperty('dev')) {
        app.set('dev', true);
    }
    
    app.set('passphrase', config.passphrase);
    app.set('dbPath', config.dbPath);
    app.set('port', config.port);
    
    if (config.admin) app.set('admin', config.admin);
};