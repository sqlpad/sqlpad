
/*  Determine if app should have open registration or not
    
    if there are no admin accounts with created dates, 
    registration will be open.
    
    The first account created will be an admin account. 
============================================================================= */

module.exports = function (app) {
    var db = app.get('db');
    var filter = {
        admin: true, 
        createdDate: {
            $lte: new Date()
        }
    };
    db.users.findOne(filter, function (err, doc) {
        if (doc) {
            app.set('openAdminRegistration', false);
        } else {
            console.log('\nNo admins found - open admin registration enabled.');
            console.log('Visit /signup to register an admin and close open admin registration.')
            app.set('openAdminRegistration', true);
        }
    });
};