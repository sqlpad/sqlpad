/*  Homepage
    
    The main homepage/root of the thing. 
    For now it just redirects the user to a more appropriate page. 
    If there are connections in the system, it redirects to the queries listing.
    If there are no connections, the user goes to the connections page
============================================================================= */
var router = require('express').Router();
var db = require('../lib/db.js');
var config = require('../lib/config.js');
const BASE_URL = config.get('baseUrl')

router.get('/', function(req, res) {
    db.connections.findOne({}, function (err, doc) {
        if (!doc && res.locals.user.admin) {
            res.redirect(BASE_URL + '/connections');
        } else {
            res.redirect(BASE_URL + '/queries');
        }
    });
});  

module.exports = router;
