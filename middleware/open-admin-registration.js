/*  Determine if app should have open registration or not
    
    If there are no admin accounts with created dates, 
    registration will be open.
    
    The first account created will be an admin account. 
============================================================================= */

var db = require('../lib/db.js');

module.exports = function openAdminRegistration (req, res, next) {
    var openAdminFilter = {
        admin: true, 
        createdDate: {
            $lte: new Date()
        }
    };
    db.users.findOne(openAdminFilter, function (err, doc) {
        if (doc) {
            res.locals.openAdminRegistration = false;
        } else {
            console.log('\nNo admins found - open admin registration enabled.');
            console.log('Visit /signup to register an admin and close open admin registration.')
            res.locals.openAdminRegistration = true;
        }
        next();
    });
}