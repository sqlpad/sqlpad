var bcrypt = require('bcrypt-nodejs'); //https://www.npmjs.org/package/bcrypt-nodejs (the native one is icky for windows)
var passport = require('passport');
var passportLocalStrategy = require('passport-local').Strategy;

module.exports = function (app) {
    
    var db = app.get('db');
    
    /*    Sign Up
    ============================================================================= */
    function signupBodyToLocals (req, res, next) {
        res.locals.password = req.body.password || '';
        res.locals.passwordConfirmation = req.body.passwordConfirmation || '';
        res.locals.email = req.body.email || '';
        next();
    }
    
    function notIfSignedIn (req, res, next) {
        if (isAuthenticated()) {
            res.locals.debug = {message: "Already signed in - why do you need to sign up?"};
            res.location('/');
            res.render('index');
        } else {
            next();
        }
    }
    
    app.get('/signup', notIfSignedIn, signupBodyToLocals, function (req, res) {
        res.render('signup');
    });
    
    app.post('/signup', signupBodyToLocals, function (req, res) {
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
                            res.redirect('/');
                        });
                    } else if (err) {
                        console.log(err);
                        res.render('signup', {message: 'An error happened.'});
                    } else if (app.get('openAdminRegistration')) {
                        // first admin in the system, so allow it to go through
                        // then once its in, turn openAdminRegistration off
                        user = {
                            email: bodyUser.email,
                            admin: true,
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
                                app.set('openAdminRegistration', false);
                                req.session.userId = newUser._id;
                                req.session.admin = newUser.admin;
                                req.session.email = newUser.email;
                                res.redirect('/');
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
    
    
    /*    Sign In / Out
    ============================================================================= */
    function signinBodyToLocals (req, res, next) {
        res.locals.email = req.body.email || '';
        res.locals.password = req.body.password || '';
        next();
    }

    app.get('/signin', signinBodyToLocals, function (req, res) {
        res.render('signin');
    });

    passport.use(new passportLocalStrategy({
        usernameField: 'email',
      },
      function(email, password, done) {
        db.users.findOne({email: email}, function (err, doc) {
            if (err) { return done(err); }
            if (doc) {
                bcrypt.compare(password, doc.passhash, function (err, isMatch) {
                    if (err) { done(err); }
                    if (isMatch) {
                        // match! redirect home
                        return done(null, {
                            id: doc._id,
                            admin: doc.admin,
                            email: doc.email
                        });
                    } else {
                        return done(null, false, { message: "wrong email or password" });
                    }
                });
            } else {
                return done(null, false, { message: "wrong email or password" });
            }
        });
      }
    ));

    passport.serializeUser(function(user, done) {
        done(null, user);
    });

    passport.deserializeUser(function(user, done) {
        done(null, user);
    });
    
    app.post('/signin',
        passport.authenticate('local', {
            successRedirect: '/',
            failureRedirect: '/error',
            failureFlash: true
        })
    );

    app.get('/signout', function (req, res) {
        req.logout();
        res.redirect('/');
    });
    
};