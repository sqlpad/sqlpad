var argv = require('yargs').argv;
var path = require('path');

module.exports = function (app) {
    if (argv.h || argv.help) {
        var helpText = "\n\n" 
                     + "SQLPAD HELP: \n"
                     + " \n"
                     + "USAGE: sqlpad [options]\n"
                     + " \n"
                     + "OPTIONS: \n"
                     + " \n"
                     + "  --passphrase [phrase]  Set passphrase for modest encryption  (recommended)\n"
                     + "  --db [path]            Set database directory                (optional)\n"
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
    
    if (argv.passphrase) {
        app.set('passphrase', argv.passphrase);
    }
    
    if (argv.db) {
        app.set('dbPath', path.resolve(argv.db));
    }
    
    if (argv.port) {
        app.set('port', argv.port);
    }  
    
    if (argv.admin) {
        app.set('admin', argv.admin);
    }
};