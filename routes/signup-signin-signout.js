var passport = require('passport');
var router = require('express').Router();
var config = require('../lib/config.js');
var checkWhitelist = require('../lib/check-whitelist');
var User = require('../models/User.js');

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

function adminRegistrationOpen (req, res, next) {
    User.adminRegistrationOpen(function (err, open) {
        res.locals.adminRegistrationOpen = open;
        next(err);
    });
}

router.get('/signup', signupBodyToLocals, adminRegistrationOpen, function (req, res) {
    res.render('signup');
});

router.post('/signup', signupBodyToLocals, adminRegistrationOpen, function (req, res) {
    if (req.body.password !== req.body.passwordConfirmation) {
        res.render('signup', {message: 'passwords do not match'});
    } else {
        User.findOneByEmail(req.body.email, function (err, user) {
            if (err) {
                return res.render('signup', {message: 'Error looking up user by email'});
            }
            if (user && user.passhash) {
                return res.render('signup', {message: 'Already signed up'});
            }
            if (user) {
                user.password = req.body.password;
                user.signupDate = new Date();
            }
            if (!user) {
                // if open admin registration or whitelisted email create user
                // otherwise exit
                if (res.locals.adminRegistrationOpen || checkWhitelist(req.body.email)) {
                    user = new User({
                        email: req.body.email,
                        password: req.body.password,
                        admin: res.locals.adminRegistrationOpen,
                        signupDate: new Date()
                    });
                } else {
                    return res.render('signup', {message: 'Sorry, but that email address has not been whitelisted yet.'});
                }
            }
            user.save(function (err, newUser) {
                if (err) {
                    console.log(err);
                    return res.render('signup', {message: 'An error happened saving the new user to DB.'});
                }
                return res.redirect(BASE_URL + '/');
            })
        })
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
