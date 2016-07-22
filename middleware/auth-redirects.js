const config = require('../lib/config.js');
const BASE_URL = config.get('baseUrl');

module.exports = function authRedirects (req, res, next) {
    // if not signed in redirect to sign in page
    if (req.isAuthenticated()) {
        next();
    } else if (req._parsedUrl.pathname === (BASE_URL + '/signin') 
            || req._parsedUrl.pathname === (BASE_URL + '/signup') 
            || req._parsedUrl.pathname.indexOf(BASE_URL + '/auth/') == 0) {
        next();
    } else if (res.locals.openAdminRegistration) {
        // if there are no users whitelisted, direct to signup
        res.redirect(BASE_URL + '/signup');
    } else {
        res.redirect(BASE_URL + '/signin');
    }
}