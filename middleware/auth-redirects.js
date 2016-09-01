const config = require('../lib/config.js');
const BASE_URL = config.get('baseUrl');

 // checks routes necessary to render query-chart or query-table pages
function isTableChartUrl (pathname) {
    return (
        pathname.indexOf(BASE_URL + '/query-chart/') == 0 // allow public to access chart links
        || pathname.indexOf(BASE_URL + '/query-table/') == 0 // allow public to access table links
        || pathname.indexOf(BASE_URL + '/api/config') == 0 // required to render query-chart or query-table
        || pathname.indexOf(BASE_URL + '/api/query-result') == 0 // required to render query-chart or query-table
        || pathname.indexOf(BASE_URL + '/api/queries/') == 0 
    )
}

module.exports = function authRedirects (req, res, next) {
    // if not signed in redirect to sign in page
    if (req.isAuthenticated()) {
        next();
    } else if (req._parsedUrl.pathname === (BASE_URL + '/signin') 
            || req._parsedUrl.pathname === (BASE_URL + '/signup') 
            || req._parsedUrl.pathname.indexOf(BASE_URL + '/auth/') == 0) {
        next();
    } else if (req.originalMethod == 'GET' && !config.get('tableChartLinksRequireAuth') && isTableChartUrl(req._parsedUrl.pathname)) {
        next();
    } else if (res.locals.openAdminRegistration) {
        // if there are no users whitelisted, direct to signup
        res.redirect(BASE_URL + '/signup');
    } else {
        res.redirect(BASE_URL + '/signin');
    }
}