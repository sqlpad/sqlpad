var passportGoogleStrategy = require('passport-google-oauth2').Strategy;

module.exports = function (app, passport) {  
    var db = app.get('db');

    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
        console.log("Disabling Google authentication streategy, since there's no GOOGLE_CLIENT_ID or no GOOGLE_CLIENT_SECRET in ENV.");
        return;
    } else {
        console.log("Enabling Google authentication Strategy.")
    }

    passport.use(new passportGoogleStrategy({
        clientID          : process.env.GOOGLE_CLIENT_ID,
        clientSecret      : process.env.GOOGLE_CLIENT_SECRET,
        callbackURL       : process.env.PUBLIC_URL + "/auth/google/callback",
        passReqToCallback : true
    },
        function(request, accessToken, refreshToken, profile, done) {
            db.users.findOne({ email: profile.email }, function(err, user){
                if (err) { return done(err, null); }
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
                    if (app.get('openAdminRegistration') || app.get('checkWhitelist')(profile.email)){
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
    
    app.get("/auth/google", passport.authenticate('google', { scope: ['email'] }));

    app.get('/auth/google/callback', 
        passport.authenticate('google', { 
            successRedirect: '/',
            failureRedirect: '/signin'
    }));
};
