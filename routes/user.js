const express = require('express');
const res = require('express/lib/response');
const router = express.Router();
const flashMessage = require('../helpers/messenger');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const passport = require('passport');

router.get('/login', (req, res) => { //this is where we get the info
    res.render('user/customer/login', {layout: 'main'}); //this is for the handlebar name
    });

router.get('/register', (req,res) => { //this is to render the page
    res.render('user/customer/register', {layout: 'main'});
});

router.post('/register', async function (req, res) { //this is to get the input of the page, req is to get what the user input
    let { name, email, password, password2, mobile, postal, address, username} = req.body; //password/password2 is from the input name in the html
    let isValid = true;                                  //this is to get the user input into the code through req.body otherwise we will have 4 lines with e.g. req.boby.name = name
    if (password.length < 6) {
        flashMessage(res, 'error', 'Password must be at least 6 characters');
        isValid = false;
    }
    if (password != password2) {
        flashMessage(res, 'error', 'Passwords do not match');
        isValid = false;
    }
    if (!isValid) {
        res.render('user/register', {
            name, email, mobile, postal, address, username
        });
        return;
    }
    try {
        // If all is well, checks if user is already registered
        let user = await User.findOne({ where: { email: email } }); //left side is column email
        // let username = await User.findOne({ where: { username: username } });
        if (user) {
            // If user is found, that means email has already been registered
            flashMessage(res, 'error', email + ' alreay registered');
            res.render('user/register', {
                name, email, mobile, postal, address, username
            });
        }
        else {
            // Create new user record
            var salt = bcrypt.genSaltSync(10);
            var hash = bcrypt.hashSync(password, salt);
            // Use hashed password
            let user = await User.create({ name, email, password: hash, mobile, postal, address, username });
            flashMessage(res, 'success', email + ' registered successfully');
            res.redirect('/user/login');
        }
    }
    catch (err) {
        console.log(err);
    }
    });


router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        // Success redirect URL
        successRedirect: '/video/listVideos',
        // Failure redirect URL
        failureRedirect: '/user/login',
        /* Setting the failureFlash option to true instructs Passport to flash
        an error message using the message given by the strategy's verify callback.
        When a failure occur passport passes the message object as error */
        failureFlash: true
    })(req, res, next);
});

router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

// router.get('/profile', ensureAuthenticated, (req, res) => {
//     User.findAll({
//         where: { userId: req.user.id },
//         order: [['dateRelease', 'DESC']],
//         raw: true
//     })
//         .then((user) => {
//             // pass object to listVideos.handlebar
//             res.render('user/profile', { user });
//         })
//         .catch(err => console.log(err));
// });
module.exports = router;
