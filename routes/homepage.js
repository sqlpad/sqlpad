/*  Homepage
    
    The main homepage/root of the thing. 
    For now it just redirects the user to a more appropriate page. 
    If there are connections in the system, it redirects to the queries listing.
    If there are no connections, the user goes to the connections page
============================================================================= */
module.exports = function (app) {
    var db = app.get('db');
    app.get('/', function(req, res) {
        var connectionExists = false;
        db.connections.findOne({}, function (err, doc) {
            if (doc) {
                connectionExists = true;
            }
            if (!connectionExists && res.locals.user.admin) {
                res.redirect('/connections');
            } else {
                res.redirect('/queries');
            }
        });
    });  
};
