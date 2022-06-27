const express = require('express');
const res = require('express/lib/response');
const router = express.Router();
const flashMessage = require('../../helpers/messenger');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const ensureAuthenticated = require('../../helpers/auth');
const uuid = require('uuid')

router.get('/login', (req, res) => { //this is where we get the info
    res.render('user/customer/login', { layout: 'main' }); //this is for the handlebar name
});

router.get('/register', (req, res) => { //this is to render the page
    res.render('user/customer/register', { layout: 'main' });
});

router.post('/register', async function (req, res) { //this is to get the input of the page, req is to get what the user input
    let { name, email, password, password2, mobile, postal, address, username, gender } = req.body; //password/password2 is from the input name in the html
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
        res.render('user/customer/register', {
            name, email, mobile, postal, address, username
        }, { layout: 'main' });
        return;
    }
    try {
        // If all is well, checks if user is already registered
        let user = await User.findOne({ where: { username: username } }); //left side is column email
        // let username = await User.findOne({ where: { username: username } });
        if (user) {
            // If user is found, that means email has already been registered
            flashMessage(res, 'error', username + ' alreay registered');
            res.render('user/customer/register', {
                name, email, mobile, postal, address, username
            }, { layout: 'main' });
        }
        else {
            // Create new user record
            var salt = bcrypt.genSaltSync(10);
            var hash = bcrypt.hashSync(password, salt);
            // Use hashed password
            let user = await User.create({ name, email, gender, password: hash, mobile, postal, address, username });
            // for deafault value is it role:member?
            flashMessage(res, 'success', username + ' registered successfully');
            res.redirect('/user/customer/login');
        }
    }
    catch (err) {
        console.log(err);
    }
});


router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        // Success redirect URL
        successRedirect: '/',
        // Failure redirect URL
        failureRedirect: '/user/customer/login' ,
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

// router.get('/profile', (req, res) => { //this is to render the page
//     res.render('user/profile');
// });

router.get('/editprofile/:id', ensureAuthenticated, (req, res) => {
    User.findByPk(req.user.id)
        .then((user) => {
            res.render('user/customer/editprofile', { user, layout: 'main' });
        })
        .catch(err => console.log(err));
});

router.post('/editprofile/:id', ensureAuthenticated, (req, res) => {
    let name = req.body.name;
    let username = req.body.username;
    let password = req.body.password;
    let password2 = req.body.password2;
    let gender = req.body.gender;
    let mobile = req.body.mobile;
    let postal = req.body.postal;
    let address = req.body.address;
    let email = req.body.email;
    if (password != password2) {
        flashMessage(res, 'error', 'Password not matching');
        res.redirect('/user/customer/editprofile/{{id}}', { layout: 'main' });
    }
    User.update(
        {
            name, username, password, password2, gender, mobile, postal, address, email
        },
        { where: { id: req.user.id } }
    )
        .then((result) => {
            console.log(result[0] + ' User updated');
            res.redirect('/user/customer/profile/{{id}}', { layout: 'main' });
        })
        .catch(err => console.log(err));
});

router.get('/profile/:id', ensureAuthenticated, (req, res) => {
    User.findByPk(req.user.id)
        .then((user) => {
            res.render('user/customer/profile', { user, layout: 'main' });
        })
        .catch(err => console.log(err));
});

router.get('/deleteUser/:id', ensureAuthenticated, async function
    (req, res) {
    try {
        let user = await User.findByPk(req.user.id);
        let result = await User.destroy({ where: { id: user.id } });
        console.log(result + ' User deleted');
        res.redirect('/user/customer/register', { layout: 'main' });
    }
    catch (err) {
        console.log(err);
    }
});
module.exports = router;
