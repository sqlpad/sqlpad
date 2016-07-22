var bcrypt = require('bcrypt-nodejs'); //https://www.npmjs.org/package/bcrypt-nodejs (the native one is icky for windows)
var passport = require('passport');
var passportLocalStrategy = require('passport-local').Strategy;
var router = require('express').Router();
var config = require('../lib/config.js');
var db = require('../lib/db.js');
var checkWhitelist = require('../lib/check-whitelist');

// NOTE: getting config here during module init is okay 
// since these configs are set via env or cli
const BASE_URL = config.get('baseUrl');


/*    Sign Up
============================================================================= */
function signupBodyToLocals (req, res, next) {
    res.locals.password = req.body.password || '';
    res.locals.passwordConfirmation = req.body.passwordConfirmation || '';
    res.locals.email = req.body.email || '';
    next();
}

function notIfSignedIn (req, res, next) {
    if (req.session && req.session.userId) {
        res.locals.debug = {message: "Already signed in - why do you need to sign up?"};
        res.location(BASE_URL + '/');
        res.render('index');
    } else {
        next();
    }
}

router.get('/signup', notIfSignedIn, signupBodyToLocals, function (req, res) {
    res.render('signup');
});

router.post('/signup', signupBodyToLocals, function (req, res) {
    if (req.body.password !== req.body.passwordConfirmation) {
        res.render('signup', {message: 'passwords are not match'});
    } else {
        bcrypt.hash(req.body.password, null, null, function(err, hash) {
            var bodyUser = {
                email: req.body.email,
                passhash: hash,
                modifiedDate: new Date(),
                createdDate: new Date()
            };
            db.users.findOne({email: bodyUser.email}, function (err, user) {
                if (user) {
                    db.users.update({_id: user._id}, {$set: bodyUser}, {}, function (err) {
                        if (err) console.log(err);
                        req.session.userId = user._id;
                        req.session.admin = user.admin;
                        req.session.email = user.email;
                        res.redirect(BASE_URL + '/'); // TODO: user still gets prompted to log in. Why?
                    });
                } else if (err) {
                    console.log(err);
                    res.render('signup', {message: 'An error happened.'});
                } else if (res.locals.openAdminRegistration || checkWhitelist(req.body.email)) {
                    // first admin in the system, so allow it to go through
                    // also allow whitelisted emails
                    user = {
                        email: bodyUser.email,
                        admin: res.locals.openAdminRegistration,
                        passhash: hash,
                        createdDate: new Date(),
                        modifiedDate: new Date()
                    };
                    db.users.insert(user, function (err, newUser) {
                        // set session, turn open registration off
                        if (err) {
                            console.log(err);
                            res.render('signup', {message: 'An error happened saving the new user to DB.'});
                        } else {
                            req.session.userId = newUser._id;
                            req.session.admin = newUser.admin;
                            req.session.email = newUser.email;
                            res.redirect(BASE_URL + '/');
                        }
                    });
                } else {
                    // not whitelisted?
                    console.log(user);
                    res.render('signup', {message: 'Sorry, but that email address has not been whitelisted yet.'});
                }
            });
        });
    }
});

router.post('/signin',
    passport.authenticate('local', {
        successRedirect: BASE_URL + '/',
        failureRedirect: BASE_URL + '/signin',
        failureFlash: true
    })
);


/*    Sign In / Out
============================================================================= */
function signinBodyToLocals (req, res, next) {
    res.locals.email = req.body.email || '';
    res.locals.password = req.body.password || '';
    next();
}

router.get('/signin', signinBodyToLocals, function (req, res) {
    res.render('signin', { strategies: passport._strategies });
});    

router.get('/signout', function (req, res) {
    req.session = null;
    res.redirect(BASE_URL + '/');
});


module.exports = router;
