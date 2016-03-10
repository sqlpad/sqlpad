
module.exports = function (app, router) {
    
    var db = app.get('db');
    var baseUrl = app.get('baseUrl');
        
    function renderUsers (req, res) {
        db.users.find({}).sort({email: 1}).exec(function (err, users) {
            res.render('users', {users: users, pageTitle: "Users"});
        });   
    }
    
    router.get('/users', renderUsers);
    
    router.post('/users/whitelist', function (req, res) {
        var user = {
            email: req.body.email,
            admin: (req.body.admin ? true : false)
        };
        db.users.insert(user, function (err) {
            if (err) {
                console.log(err);
                res.location(baseUrl + '/users');
                res.locals.debug = "Couldn't add new user for some reason.";
                renderUsers(req, res);
            } else {
                res.redirect(baseUrl + '/users');
            }
        });
    });
    
    router.post('/users/make-admin/:_id', function (req, res) {
        db.users.update({_id: req.params._id}, {$set: {admin: true}}, {}, function (err) {
            if (err) console.log(err);
            res.redirect(baseUrl + '/users');
        });
    });
    
    router.post('/users/remove-admin/:_id', function (req, res) {
        // can't unadmin one's self
        if (req.user._id === req.params._id) {
            res.location(baseUrl + '/users');
            res.locals.debug = "You can't unadmin yourself!";
            renderUsers(req, res);
        } else {
            db.users.update({_id: req.params._id}, {$set: {admin: false}}, {}, function (err) {
                if (err) console.log(err);
                res.redirect(baseUrl + '/users');
            });
        }
            
    });
    
    router.delete('/users/:_id', function (req, res) {
        db.users.remove({_id: req.params._id}, function (err) {
            if (err) console.log(err);
            res.redirect(baseUrl + '/users');
        });
    });
      
};
