const express = require('express');
const res = require('express/lib/response');
const router = express.Router();
const flashMessage = require('../../helpers/messenger');
const ensureAuthenticated = require('../../helpers/auth');

router.get('/admin', ensureAuthenticated, (req, res) => {
	var page='report';
	res.render('report/report', {layout: 'admin', page});
});

// router.post('/login', (req, res, next) => {
//     passport.authenticate('local', {
//         // Success redirect URL
//         successRedirect: '/',
//         // Failure redirect URL
//         failureRedirect: '/user/login' ,
//         /* Setting the failureFlash option to true instructs Passport to flash
//         an error message using the message given by the strategy's verify callback.
//         When a failure occur passport passes the message object as error */
//         failureFlash: true
//     })(req, res, next);
// });

module.exports = router;