const express = require('express');
const res = require('express/lib/response');
const router = express.Router();
const flashMessage = require('../../helpers/messenger');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const ensureAuthenticated = require('../../helpers/auth');
const uuid = require('uuid');
const Cart = require('../../models/Cart');
// Required for email verification
require('dotenv').config();
const jwt = require('jsonwebtoken');
const sgMail = require('@sendgrid/mail');


router.get('/login', (req, res) => { //this is where we get the info
    res.render('user/customer/login', { layout: 'main' }); //this is for the handlebar name
});

router.get('/register', (req, res) => { //this is to render the page
    res.render('user/customer/register', { layout: 'main' });
});

function sendEmail(toEmail, url) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const message = {
        to: toEmail,
        from: `BubbleT <${process.env.SENDGRID_SENDER_EMAIL}>`,
        subject: 'Verify BubbleT Account',
        html: `Thank you registering with Video Jotter.<br><br> Please
<a href=\"${url}"><strong>verify</strong></a> your account.`
    };
    // Returns the promise from SendGrid to the calling function
    return new Promise((resolve, reject) => {
        sgMail.send(message)
            .then(response => resolve(response))
            .catch(err => reject(err));
    });
}

function sendPassword(toEmail, url) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const message = {
        to: toEmail,
        from: `BubbleT <${process.env.SENDGRID_SENDER_EMAIL}>`,
        subject: 'Reset Password',
        html: `Click on <a href=\"${url}"><strong>OTP</strong></a> to get your new password. <br>
        OTP expires in 15mins.`
    };
    // Returns the promise from SendGrid to the calling function
    return new Promise((resolve, reject) => {
        sgMail.send(message)
            .then(response => resolve(response))
            .catch(err => reject(err));
    });
}

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
        else if (user) {
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
            // Send email
            let token = jwt.sign(email, process.env.APP_SECRET);
            let url = `${process.env.BASE_URL}:${process.env.PORT}/user/verify/${user.id}/${token}`;
            sendEmail(user.email, url)
                .then(response => {
                    console.log(response);
                    flashMessage(res, 'success', user.email + ' registered successfully');
                    res.redirect('/user/login');
                })
                .catch(err => {
                    console.log(err);
                    flashMessage(res, 'error', 'Error when sending email to ' +
                        user.email);
                    res.redirect('/');
                });
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
        failureRedirect: '/user/login' ,
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
    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(password, salt);
    User.update(
        {
            name, username, password: hash, password2, gender, mobile, postal, address, email
        },
        { where: { id: req.user.id } }
    )
        .then((result) => {
            console.log(result[0] + ' User updated');
            res.redirect('/user/profile/{{id}}');
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
        res.redirect('/user/register');
    }
    catch (err) {
        console.log(err);
    }
});

router.get('/forgotpassword', (req,res) => {
    res.render('user/customer/forgotpassword', {layout:'main'});
});

router.post('/forgotpassword', async function (req,res){
    let { username, email } = req.body;
    let user = await User.findOne({ where: { username: username } });
    if (user)
    {
        if(email != user.email)
        {
            flashMessage(res, 'error', 'Email and username does not match username.');
            res.render('user/customer/forgotpassword', { layout: 'main' });
        }else{
            res.send("Correct");
            let token = jwt.sign(email, process.env.APP_SECRET, {expiresIn: '15m'});
            let url = `${process.env.BASE_URL}:${process.env.PORT}/user/OTP/${user.id}/${token}`;
            sendPassword(user.email, url)
                .then(response => {
                    console.log(response);
                    flashMessage(res, 'success', "One Time Password(OTP) has been sent to "+ user.email);
                    res.redirect('/user/login');
                })
                .catch(err => {
                    console.log(err);
                    flashMessage(res, 'error', 'Error when sending email to ' + user.email);
                    res.redirect('/');
                });
        }
    }
});

router.get('/verify/:userId/:token', async function (req, res) {
    let id = req.params.userId;
    let token = req.params.token;
    try {
        // Check if user is found
        let user = await User.findByPk(id);
        if (!user) {
            flashMessage(res, 'error', 'User not found');
            res.redirect('/user/login');
            return;
        }
        // Check if user has been verified
        if (user.verified) {
            flashMessage(res, 'info', 'User already verified');
            res.redirect('/user/login');
            return;
        }
        // Verify JWT token sent via URL
        let authData = jwt.verify(token, process.env.APP_SECRET);
        if (authData != user.email) {
            flashMessage(res, 'error', 'Unauthorised Access');
            res.redirect('/user/login');
            return;
        }
        let result = await User.update(
            { verified: 1 },
            { where: { id: user.id } });
        console.log(result[0] + ' user updated');
        flashMessage(res, 'success', user.email + ' verified. Please login');
        res.redirect('/user/login');
    }
    catch (err) {
        console.log(err);
    }
});

router.get('/OTP/:userId/:token', async function (req, res) {
    let id = req.params.userId;
    let token = req.params.token;})

module.exports = router;
