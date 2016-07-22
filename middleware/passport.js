var bcrypt = require('bcrypt-nodejs');  
var passport = require('passport');
var passportLocalStrategy = require('passport-local').Strategy;
var passportGoogleStrategy = require('passport-google-oauth2').Strategy;
var db = require('../lib/db.js');
var config = require('../lib/config.js');
var checkWhitelist = require('../lib/check-whitelist.js');

const BASE_URL = config.get('baseUrl');
const GOOGLE_CLIENT_ID = config.get('googleClientId');
const GOOGLE_CLIENT_SECRET = config.get('googleClientSecret');
const PUBLIC_URL = config.get('publicUrl');

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    db.users.findOne({_id: id}, function (err, doc) {
        if (doc) {
            done(null, {
                id: doc._id,
                admin: doc.admin,
                email: doc.email
            });
        } else {
            done(null, false);
        }
    });
});

passport.use(new passportLocalStrategy({
        usernameField: 'email'
    },
    function(email, password, done) {
        db.users.findOne({email: email, createdDate: {$exists: true}}, function (err, doc) {
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

if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET && PUBLIC_URL) {
    passport.use(new passportGoogleStrategy({
            clientID          : GOOGLE_CLIENT_ID,
            clientSecret      : GOOGLE_CLIENT_SECRET,
            callbackURL       : PUBLIC_URL + BASE_URL + "/auth/google/callback",
            passReqToCallback : true
        },
        function(request, accessToken, refreshToken, profile, done) {
            db.users.findOne({ email: profile.email }, function(err, user){
                if (err) { 
                    return done(err, null); 
                }
                if (user) {
                    if (!user.createdDate) {
                        db.users.update({_id: user._id}, {$set: {createdDate: new Date()}}, function (err) {
                            if (err) console.log(err);
                            return done(null, {
                                id: user._id,
                                email: user.email,
                                admin: user.admin
                            });
                        });
                    } else {
                        return done(null, {
                            id: user._id,
                            email: user.email,
                            admin: user.admin
                        });
                    }
                } else {
                    // TODO: res.locals not available here. 
                    // openAdminRegistration check can be moved to User model and determined when needed 
                    if (res.locals.openAdminRegistration || checkWhitelist(profile.email)){
                        var user = {
                            email: profile.email,
                            admin: res.locals.openAdminRegistration, 
                            createdDate: new Date()
                        }
                        db.users.insert(user, function (err, newUser) {
                            if (err){
                                console.log("Error: ", err);
                            }
                            return done(null, {
                                id: newUser._id,
                                email: user.email,
                                admin: user.admin                                
                            });
                        });
                    } else {
                        return done(null, false, {message: "You haven't been invited by an admin yet."});
                    }
                }
            })
        }
    ));
}

