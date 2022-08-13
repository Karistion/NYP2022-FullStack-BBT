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
const XLSX = require('xlsx');
const multer = require('multer');
const path = require('path');
var Luhn = require('luhn-js');
const validate = require('validator');
const sharp = require("sharp");
// Required for email verification
require('dotenv').config();
const jwt = require('jsonwebtoken');
const sgMail = require('@sendgrid/mail');
const otpGenerator = require('otp-generator');


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

function sendPassword(toEmail, url, OTP) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const message = {
        to: toEmail,
        from: `BubbleT <${process.env.SENDGRID_SENDER_EMAIL}>`,
        subject: 'Reset Password',
        html: ` Your OTP: ${OTP} <br>
        OTP expires in 15mins.`
    };
    // Returns the promise from SendGrid to the calling function
    return new Promise((resolve, reject) => {
        sgMail.send(message)
            .then(response => resolve(response))
            .catch(err => reject(err));
    });
}

function sendSuspend(toEmail, url) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const message = {
        to: toEmail,
        from: `BubbleT <${process.env.SENDGRID_SENDER_EMAIL}>`,
        subject: 'Suspension of Account',
        html: `Your account has been suspended due to suspicious activity.<br>
        For appeal, please click the <a href=\"${url}"><strong>link</strong></a>.<br>
        Sincerely,<br>
        BubbleT Development Team`
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
            name, email, mobile, postal, address, username, layout: 'main' });
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
                name, email, mobile, postal, address, username, layout: 'main' });
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
            var userId=user.id
            Cart.create({userId})
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


router.post('/login',async function (req, res, next) {
    let {username} = req.body;
    let user = await User.findOne({ where: { username: username } });
    if (user){
        if (user.activity == 0){
            flashMessage(res, 'error', 'Account has been suspended.');
            res.render('user/customer/login', { layout: 'main' });
        }
        else if (user.member == "member") {
            passport.authenticate('local', {
                // Success redirect URL
                successRedirect: '/',
                // Failure redirect URL
                failureRedirect: '/user/login',
                /* Setting the failureFlash option to true instructs Passport to flash
                an error message using the message given by the strategy's verify callback.
                When a failure occur passport passes the message object as error */
                failureFlash: true
            })(req, res, next);
        }
        else if (user.member == "admin") {
            passport.authenticate('local', {
                // Success redirect URL
                successRedirect: '/report/admin',
                // Failure redirect URL
                failureRedirect: '/user/login',
                /* Setting the failureFlash option to true instructs Passport to flash
                an error message using the message given by the strategy's verify callback.
                When a failure occur passport passes the message object as error */
                failureFlash: true
            })(req, res, next);
        }
    }else{
        flashMessage(res, 'error', 'Account does not exist.');
        res.redirect('/user/login');       
    }
    
});

router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

// router.get('/profile', (req, res) => { //this is to render the page
//     res.render('user/profile');
// });

router.get('/editprofile/:id', ensureAuthenticated, (req, res) => {
    if (req.params.id != req.user.id){
        flashMessage(res, 'error', 'Unauthorised Access')
        res.redirect('/')
    }else{
        User.findByPk(req.user.id)
            .then((user) => {
                res.render('user/customer/editprofile', { user, layout: 'main' });
            })
            .catch(err => console.log(err));
    }
});

router.post('/editprofile/:id', ensureAuthenticated, async function (req, res){
    let name = req.body.name;
    let username = req.body.username;
    let password = req.body.password;
    let password2 = req.body.password2;
    let gender = req.body.gender;
    let mobile = req.body.mobile;
    let postal = req.body.postal;
    let address = req.body.address;
    let email = req.body.email;
    // let user = await User.findOne({ where: { username: username } });
    // if (user){
    //     flashMessage(res, 'error', username + ' alreay taken');
    //     res.redirect('/user/customer/editprofile/{{id}}', { layout: 'main' });
    // };
    if (password != password2) {
        flashMessage(res, 'error', 'Password not matching');
        res.redirect(`/user/customer/editprofile/${req.user.id}`, { layout: 'main' });
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
            res.redirect(`/user/profile/${req.user.id}`);
        })
        .catch(err => console.log(err));
});

router.get('/profile/:id', ensureAuthenticated, (req, res) => {
    if (req.params.id != req.user.id){
        flashMessage(res, 'error', 'Unauthorised Access')
        res.redirect('/')
    }else{
    User.findByPk(req.user.id)
        .then((user) => {
            res.render('user/customer/test', { user, layout: 'main' });
        })
        .catch(err => console.log(err));}
});

router.get('/deleteUser/:id', ensureAuthenticated, async function
    (req, res) {
    if (req.params.id != req.user.id){
        flashMessage(res, 'error', 'Unauthorised Access')
        res.redirect('/')
    }else{
    try {
        let user = await User.findByPk(req.user.id);
        let result = await User.destroy({ where: { id: user.id } });
        console.log(result + ' User deleted');
        res.redirect('/user/register');
    }
    catch (err) {
        console.log(err);}
    }
});

router.get('/suspendUser/:id', ensureAuthenticated, async function
    (req, res) {
    if (req.user.member != 'admin'){
        flashMessage(res, 'error', 'Unauthorised Access')
        res.redirect('/')
    }else{
    try {
        let activity = 0;
        User.update(
            {activity},
            { where: { id: req.params.id } }
        )
        console.log('User Suspended');
        let user = await User.findByPk(req.params.id);
        let email = user.email;
        let token = jwt.sign(email, process.env.APP_SECRET);
        let url = `${process.env.BASE_URL}:${process.env.PORT}/user/suspend/${user.id}/${token}`;
        sendSuspend(email,url);
        res.redirect('/report/listUsers');
    }
    catch (err) {
        console.log(err);
    }}
});

router.get('/forgotpassword', (req,res) => {
    res.render('user/customer/forgotpassword', {layout:'main'});
});

router.post('/forgotpassword', async function (req,res){
    let { username, email } = req.body;
    let user = await User.findOne({ where: { username: username } });
    if (user)
    {
        if(!user || email != user.email)
        {
            flashMessage(res, 'error', 'Email and username does not match username.');
            res.render('user/customer/forgotpassword', { layout: 'main' });
        }else{
            // res.send("Correct");
            let token = jwt.sign(email, process.env.APP_SECRET);
            let url = `${process.env.BASE_URL}:${process.env.PORT}/user/OTP/${user.id}/${token}`;
            let OTP = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false });
            sendPassword(user.email, url,OTP)
                .then(response => {
                    console.log(response);
                    flashMessage(res, 'success', "One Time Password(OTP) has been sent to "+ user.email);
                    User.update(
                        { OTP: OTP },
                        { where: { id: user.id } });
                    console.log('user OTP updated');
                    res.redirect('/user/otp/:id');
                })
                .catch(err => {
                    console.log(err);
                    flashMessage(res, 'error', 'Error when sending email to ' + user.email);
                    // res.redirect('/');
                });
        }
    }
});

router.get('/otp/:id', (req,res)=>{
    res.render('user/customer/otp', {layout:'main'});
});

router.post('/otp/:id',async (req,res)=>{
    let otp = req.body.otp;
    let user = await User.findOne({ where: { OTP: otp } });
    // console.log(user.id);
    if (user){
        if (user.OTP == otp){
            res.redirect('/user/newPW/' + user.id);
        }else{
            flashMessage(res,'error', 'Invalid OTP')
            res.render('/otp/:id', {layout: 'main'})
        }
    }
});

router.get('/newPW/:id', (req,res)=>{
    res.render('user/customer/newPW', { layout: 'main'})
});

router.post('/newPW/:id', async (req,res) => {
    let { password, password2 } = req.body;
    let isValid = true;                              
    if (password.length < 6) {
        flashMessage(res, 'error', 'Password must be at least 6 characters');
        isValid = false;
    }
    if (password != password2) {
        flashMessage(res, 'error', 'Passwords do not match');
        isValid = false;
    }
    if (!isValid) {
        res.render('user/customer/newPW', {
            password
        , layout: 'main' });
        return;
    } try {
        // If all is well, checks if user is already registered
        let user = await User.findByPk(req.params.id);
        var salt = bcrypt.genSaltSync(10);
        var hash = bcrypt.hashSync(password, salt);
        User.update({ password:hash},
            { where: { id: user.id } });
        res.redirect('/user/login');
    } catch (err) {
        console.log(err);}
})

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

// router.get('/OTP/:userId/:token', async function (req, res) {
//     let password = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false });
//     let id = req.params.userId;
//     let token = req.params.token;
//     try {
//         // Check if user is found
//         let user = await User.findByPk(id);
//         if (!user) {
//             flashMessage(res, 'error', 'User not found');
//             res.redirect('/user/login');
//             return;
//         }
//         // Check if user has been verified
//         // if (user.verified) {
//         //     flashMessage(res, 'info', 'User already verified');
//         //     res.redirect('/user/login');
//         //     return;
//         // }
//         // Verify JWT token sent via URL
//         let authData = jwt.verify(token, process.env.APP_SECRET);
//         if (authData != user.email) {
//             flashMessage(res, 'error', 'Unauthorised Access');
//             res.redirect('/user/login');
//             return;
//         }
//         var salt = bcrypt.genSaltSync(10);
//         var hash = bcrypt.hashSync(password, salt);
//         let result = await User.update(
//             { password:hash },
//             { where: { id: user.id } });
//         console.log(result[0] + ' user OTP updated');
//         flashMessage(res, 'success', user.email + 'Your OTP:', password,'. Please login');
//         // res.redirect('/user/login');
//     }
//     catch (err) {
//         console.log(err);
//     }
// });

router.get('/suspend/:id/:token', async function (req, res) {
    let id = req.params.id;
    let token = req.params.token;
    try {
        // Check if user is found
        let user = await User.findByPk(id);
        console.log(id);
        if (!user) {
            flashMessage(res, 'error', 'User not found');
            res.redirect('/user/login');
            return;
        }
        // Check if user has been verified
        // if (user.verified) {
        //     flashMessage(res, 'info', 'User already verified');
        //     res.redirect('/user/login');
        //     return;
        // }
        // Verify JWT token sent via URL
        let authData = jwt.verify(token, process.env.APP_SECRET);
        if (authData != user.email) {
            flashMessage(res, 'error', 'Unauthorised Access');
            res.redirect('/user/login');
            return;
        }
        res.redirect('/user/suspend');
    }
    catch (err) {
        console.log(err);
    }
});

router.get('/suspend', (req, res) => { //this is where we get the info
    User.findByPk(req.params.id)
        .then((user) => {
            res.render('user/customer/suspend', { user, layout: 'main' });
        })
        .catch(err => console.log(err));
});

router.post('/suspend', async (req,res) =>{
    let username = req.body.username;
    let email = req.body.email;
    let appeal = req.body.appeal;
    // let user = User.findOne({ where: { username: username } });
    await User.update(
        { appeal:appeal },
        { where: { username: username } });
    flashMessage(res,'success','Your appeal has been submitted.')
    res.redirect('/')

});

router.get('/appeal/:id',async (req,res)=>{
    let user = await User.findByPk(req.params.id);
    console.log(user.appeal);
    res.render('user/customer/appeal',{layout:'main', user});
});

router.post('/appeal/:id',(req,res)=>{
    let activity = 1;
    let appeal = null;
    User.update({activity},{where:{id:req.params.id}});
    User.update({ appeal }, { where: { id: req.params.id } });
    console.log('user no longer suspended');
    flashMessage(res,'success', 'Account has been activated.')
    res.redirect('/report/admin')
});

router.get('/export', async (req,res) =>{
    let array = await User.findAll({
        order: [['id', 'ASC']],
        raw: true
    });
    let array2 = [];
    // array.forEach(function(element){
    //     array2.push(element);
    // });
    for (var i = 0; i < array.length; i++) {
        array2.push(array[i]);
    }
    var userpath = path.dirname(__dirname).split("\\")
    userpath.splice(3)
    userpath = userpath.join("\\")
    // console.log(array2);
    // const test = [{name:'Jordan', email:'lol@gmail.com', age:18}];
    const convertJsontoExcel =()=>{
        const workSheet = XLSX.utils.json_to_sheet(array2);
        const workBook = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(workBook,workSheet,'Users');
        //Generate Buffer
        XLSX.write(workBook,{bookType:'xlsx',type:'buffer'});
        //Binary String
        XLSX.write(workBook,{bookType:'xlsx',type:'binary'});
        XLSX.writeFile(workBook,`${userpath}/Downloads/usersData.xlsx`);
    }
    convertJsontoExcel();
    flashMessage(res,'success','File has been downloaded.')
    res.redirect('/report/listUsers');
    // flashMessage(res, 'success', "Excel sheet created.");
});

// Required for file upload
const fs = require('fs');
const upload = require('../../helpers/addImage');

router.post('/profile', ensureAuthenticated, (req, res) => {
    // Creates user id directory for upload if not exist
    if (!fs.existsSync('./public/uploads/' + req.user.id)) {
        fs.mkdirSync('./public/uploads/' + req.user.id, {
            recursive:
                true
        });
    }
    upload(req, res, (err) => {
        if (err) {
            // e.g. File too large
            res.json({ file: '/img/no-image.jpg', err: err });
        }
        else {
            res.json({
                file: `/uploads/${req.user.id}/${req.file.filename}`
            });
        }
    });
});

router.post('/profileSave/:id', ensureAuthenticated, async (req, res) => {
    let {posterURL, posterUpload} = req.body;
    // console.log(posterURL);
    // let metadata = getMetadata(posterURL);
    posterURL = posterURL.split("/")[3]
    // let image = `${req.file.filename}`
    await User.update({ image: posterURL }, { where: { id: req.user.id } });
    res.redirect(`/user/profile/${req.user.id}`);
});

router.post('/profileSaveAdmin/:id', ensureAuthenticated, async (req, res) => {
    let { posterURL, posterUpload } = req.body;
    // console.log(posterURL);
    // let metadata = getMetadata(posterURL);
    posterURL = posterURL.split("/")[3]
    // let image = `${req.file.filename}`
    await User.update({ image: posterURL }, { where: { id: req.user.id } });
    res.redirect(`/report/adminProfile`);
});
// async function getMetadata(posterURL) {
//     let posterURL2 = "./public"+posterURL;
//     const metadata = await sharp(posterURL2).metadata();
//     console.log(metadata);
//     return metadata;
// };
// async function resizeImage(posterURL) {
//     try {
//         await sharp("sammy.png")
//             .resize({
//                 width: 150,
//                 height: 97
//             })
//             .toFile("sammy-resized.png");
//     } catch (error) {
//         console.log(error);
//     }
// };

router.get('/e-wallet/:id', ensureAuthenticated,(req,res)=>{
    res.render('user/customer/credit');
});

router.post('/e-wallet/:id', async function (req, res) {
    let { card_number, card_name, expiry_date, cvv,amount } = req.body;
    isValid = true;
    card_number = card_number.replace(/\s+/g, '');
    console.log(amount);
    if (!Luhn.isValid(card_number)) {
        flashMessage(res, 'error', 'Invalid Card Number');
        isValid = false;
    }
    if (!isValid) {
        res.render('user/customer/credit', {
            card_number, card_name, expiry_date, cvv
        });
        return;
    }else {
        let userId = req.params.id;
        let user = await User.findByPk(req.params.id);
        amount = amount.replace('$','');
        amount = amount.replace(',','');
        let value = parseFloat(amount);
        let wallet = user.wallet + value;
        await User.update({wallet},{ where: { id: userId } });
        flashMessage(res,'success','Wallet has been topped up!');
        res.redirect(`/user/profile/${req.user.id}`);
    }
});

router.get('/test', (req, res) => { //this is where we get the info
    res.render('user/customer/test'); //this is for the handlebar name
});

router.get('/convert', (req, res) => { 
    if(req.get('referer')!='http://localhost:5000/user/profile/'+req.user.id){
        res.redirect('/user/profile/'+req.user.id)
    }else{
    if (req.user.loyalty<=1){
        flashMessage(res, 'success', `${req.user.loyalty} added to your wallet`)
        User.update(
            { wallet: req.user.wallet + req.user.loyalty, loyalty:0 },
            { where: { id: req.user.id } }
        )
    }else if (req.user.loyalty<=2){
        flashMessage(res, 'success', `${req.user.loyalty*1.1} added to your wallet`)
        User.update(
            { wallet: req.user.wallet + (req.user.loyalty*1.1), loyalty:0 },
            { where: { id: req.user.id } }
        )
    }else if (req.user.loyalty<=3){
        flashMessage(res, 'success', `${req.user.loyalty*1.2} added to your wallet`)
        User.update(
            { wallet: req.user.wallet + (req.user.loyalty*1.2), loyalty:0 },
            { where: { id: req.user.id } }
        )
    }else if (req.user.loyalty<=5){
        flashMessage(res, 'success', `${req.user.loyalty*1.3} added to your wallet`)
        User.update(
            { wallet: req.user.wallet + (req.user.loyalty*1.3), loyalty:0 },
            { where: { id: req.user.id } }
        )
    }else if (req.user.loyalty<=10){
        flashMessage(res, 'success', `${req.user.loyalty*1.4} added to your wallet`)
        User.update(
            { wallet: req.user.wallet + (req.user.loyalty*1.4), loyalty:0 },
            { where: { id: req.user.id } }
        )
    }else{
        flashMessage(res, 'success', `${req.user.loyalty*1.5} added to your wallet`)
        User.update(
            { wallet: req.user.wallet + (req.user.loyalty*1.5), loyalty:0 },
            { where: { id: req.user.id } }
        )
    }}
    res.redirect('/user/profile/'+req.user.id); 
});

module.exports = router;
