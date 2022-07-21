const express = require('express');
const res = require('express/lib/response');
const router = express.Router();
const flashMessage = require('../../helpers/messenger');
const ensureAuthenticated = require('../../helpers/auth');
const User = require('../../models/User');

router.get('/admin', ensureAuthenticated, (req, res) => {
	var page='report';
	res.render('report/report', {layout: 'admin', page});
});

// router.get('/usertable', ensureAuthenticated, (req, res) => {
// 	var page = 'user';
// 	res.render('user/admin/usertable', { layout: 'admin', page });
// });

router.get('/listUsers', ensureAuthenticated, (req, res) => {
	User.findAll({
		order: [['createdAt', 'DESC']],
		raw: true
	})
		.then((user) => {
			console.log(user);
			// pass object to listVideos.handlebar
			var page = 'users';
			res.render('user/admin/usertable', { layout: 'admin', page, user });
		})
		.catch(err => console.log(err));
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