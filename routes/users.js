var router = require('express').Router();
var config = require('../lib/config.js');
const BASE_URL = config.get('baseUrl');
var User = require('../models/User.js');

function renderUsers (req, res) {
    User.findAll(function (err, users) {
        if (err) console.log(err);
        res.render('users', {users: users, pageTitle: "Users"});
    });   
}

router.get('/api/users/current', function (req, res) {
    if (req.isAuthenticated() && res.locals.user) {
        res.json({
            success: true,
            error: null,
            user: {
                _id: res.locals.user.id,
                email: res.locals.user.email,
                admin: res.locals.user.admin
            }
        });
    } else {
        res.json({
            success: false,
            error: "No user authenticated"
        });
    }     
});

router.get('/users', renderUsers);

router.post('/users/whitelist', function (req, res) {
    var user = new User({
        email: req.body.email,
        admin: (req.body.admin ? true : false)
    });
    user.save(function (err, newUser) {
        if (err) {
            console.log(err);
            res.location(BASE_URL + '/users');
            res.locals.debug = "Couldn't add new user for some reason.";
            renderUsers(req, res);
        } else {
            res.redirect(BASE_URL + '/users');
        }
    });
});

router.post('/users/make-admin/:_id', function (req, res) {
    User.findOneById(req.params._id, function (err, user) {
        if (err) console.error(err);
        user.admin = true;
        user.save(function (err) {
            if (err) console.error(err);
            res.redirect(BASE_URL + '/users');
        });
    });
});

router.post('/users/remove-admin/:_id', function (req, res) {
    // can't unadmin one's self
    if (req.user._id === req.params._id) {
        res.location(BASE_URL + '/users');
        res.locals.debug = "You can't unadmin yourself!";
        renderUsers(req, res);
    } else {
        User.findOneById(req.params._id, function (err, user) {
            if (err) console.error(err);
            user.admin = false;
            user.save(function (err) {
                if (err) console.error(err);
                res.redirect(BASE_URL + '/users');
            });
        });
    }
});

router.delete('/users/:_id', function (req, res) {
    User.removeOneById(req.params._id, function (err) {
        if (err) console.log(err);
        res.redirect(BASE_URL + '/users');
    });
});
      
module.exports = router;