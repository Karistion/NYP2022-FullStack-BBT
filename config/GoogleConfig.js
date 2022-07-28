const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User")
const passport = require("passport")

async function InitaliseGoogleLogin() {
    passport.use(
        new GoogleStrategy(
            {
                clientID:
                    "1064844563981-jhen95c3vgcl5brl328apss4e7tsf2jk.apps.googleusercontent.com",
                clientSecret: "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",
                callbackURL: "http://localhost:5000/auth/google/callback",

            },
            async (accessToken, refreshToken, profile, done) => {

                const [user, created] = await User.findOrCreate({
                    where: { email: profile.emails[0].value},
                    defaults: {
                        name: profile.displayName,
                        password: null,
                        email: profile.emails[0].value,
                        gender: null,
                        mobile: null,
                        postal: null,
                        address: null,
                        verified: 1,
                        username: null,
                        member: 'member',
                        activity: 1,
                        createdAt: Date.now(),
                        updatedAt: Date.now()
                    },
                });

                if (created) {
                    return done(null, user, { message: "You created your account! Welcome" })
                }
                else {
                    // if(user.disabled) {
                    //   return done(null, false, {message: "Your account has been disabled!"})
                    // }
                    return done(null, user, { message: "Welcome!" })
                }
            }
        )
    );

    passport.serializeUser((user, done) => {
        return done(null, user);
    });

    passport.deserializeUser((user, done) => {
        return done(null, user);
    });
}

module.exports = InitaliseGoogleLogin