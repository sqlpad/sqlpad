
module.exports = function (app) {
    
    var db = app.get('db');
        
    function renderUsers (req, res) {
        db.users.find({}).sort({email: 1}).exec(function (err, users) {
            res.render('users', {users: users, pageTitle: "Users"});
        });   
    }
    
    app.get('/users', renderUsers);
    
    app.post('/users/whitelist', function (req, res) {
        var user = {
            email: req.body.email,
            admin: (req.body.admin ? true : false)
        };
        db.users.insert(user, function (err) {
            if (err) {
                console.log(err);
                res.location('/users');
                res.locals.debug = "Couldn't add new user for some reason.";
                renderUsers(req, res);
            } else {
                res.redirect('/users');
            }
        });
    });
    
    app.post('/users/make-admin/:_id', function (req, res) {
        db.users.update({_id: req.params._id}, {$set: {admin: true}}, {}, function (err) {
            if (err) console.log(err);
            res.redirect('/users');
        });
    });
    
    app.post('/users/remove-admin/:_id', function (req, res) {
        // can't unadmin one's self
        if (req.user._id === req.params._id) {
            res.location('/users');
            res.locals.debug = "You can't unadmin yourself!";
            renderUsers(req, res);
        } else {
            db.users.update({_id: req.params._id}, {$set: {admin: false}}, {}, function (err) {
                if (err) console.log(err);
                res.redirect('/users');
            });
        }
            
    });
    
    app.delete('/users/:_id', function (req, res) {
        db.users.remove({_id: req.params._id}, function (err) {
            if (err) console.log(err);
            res.redirect('/users');
        });
    });
      
};