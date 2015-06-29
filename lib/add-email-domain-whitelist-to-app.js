/*  Set and check whitelisted email domains so that users with the appropriate
 emails do not have to explicitly be invited.

 This checks the WHITELISTED_DOMAINS env variable, which is a string of space
 delimited domains.

 Example: "baz.com foo.bar.com" will allow anyone with a @baz.com or @foo.bar.com
 email to sign up. The domains and subdomains must match exactly (i.e. someone
 with a @bar.com or @123.baz.com would not be able to sign up.)
============================================================================= */
module.exports = function(app){
    
    function checkWhitelist (email) {
        if (process.env.WHITELISTED_DOMAINS) {
            var whitelistDomains = process.env.WHITELISTED_DOMAINS.split(' ');
            var domain = email.split('@')[1];
            for (var i = 0; i < whitelistDomains.length; i++) {
                if (domain == whitelistDomains[i]){
                    return true;
                }
            }   
        }
        return false;
    }

    app.set('checkWhitelist', checkWhitelist);
}