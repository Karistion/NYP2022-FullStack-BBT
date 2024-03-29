const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../models/User');
function localStrategy(passport) {
    passport.use(
        new LocalStrategy({ usernameField: 'username' }, (username, password, done) => {
            User.findOne({ where: { username: username } })
                .then(user => {
                    if (!user) {
                        return done(null, false, { message: 'No User Found' });
                    }
                    // Match password
                    isMatch = bcrypt.compareSync(password, user.password); //password is user input, user.password is database password
                    if (!isMatch) {
                        return done(null, false, {message: 'Password incorrect' });
                        }
                    // Email Verified
                    if (!user.verified) {
                        return done(null, false, { message: 'Email not verified' });
                    }
                        return done(null, user);
                    })
        }));
    // Serializes (stores) user id into session upon successful
    // authentication
    passport.serializeUser((user, done) => {
        // user.id is used to identify authenticated user
        done(null, user.id);
    });
    // User object is retrieved by userId from session and
    // put into req.user
    passport.deserializeUser((userId, done) => {
        User.findByPk(userId) //PK = primary key
            .then((user) => {
                done(null, user);
                // user object saved in req.session
            })
            .catch((done) => {
                // No user found, not stored in req.session
                console.log(done);
            });
    });
}
module.exports = { localStrategy };