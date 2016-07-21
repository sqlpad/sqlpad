var passportGoogleStrategy = require('passport-google-oauth2').Strategy;
var db = require('../lib/db.js');
var config = require('../lib/config.js');
var checkWhitelist = require('../lib/check-whitelist.js');

const BASE_URL = config.get('baseUrl');
const GOOGLE_CLIENT_ID = config.get('googleClientId');
const GOOGLE_CLIENT_SECRET = config.get('googleClientSecret');
const PUBLIC_URL = config.get('publicUrl');

module.exports = function (app, passport, router) {
    
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
        return;
    } else {
        console.log("Enabling Google authentication Strategy.")
    }

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
                    if (app.get('openAdminRegistration') || checkWhitelist(profile.email)){
                        var user = {
                            email: profile.email,
                            admin: app.get('openAdminRegistration'), 
                            createdDate: new Date()
                        }
                        db.users.insert(user, function (err, newUser) {
                            if (err == null){
                                app.set('openAdminRegistration', false);
                            } else {
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
    
    router.get("/auth/google", passport.authenticate('google', { scope: ['email'] }));

    router.get('/auth/google/callback', 
        passport.authenticate('google', { 
            successRedirect: BASE_URL + '/',
            failureRedirect: BASE_URL + '/signin'
    }));
};
