const express = require('express');
const res = require('express/lib/response');
const router = express.Router();
const flashMessage = require('../../helpers/messenger');
const ensureAuthenticated = require('../../helpers/auth');
const User = require('../../models/User');
const Invoice = require('../../models/Invoice')

router.get('/admin', ensureAuthenticated, async (req, res) => {
	var orders= await Invoice.findAll({where: {delivered:0}, order:['createdAt'], raw: true})
	var invoices= await Invoice.findAll({where: {delivered:1}, order:['createdAt'], raw: true})
	var users= await User.findAll({where: {member:'member'}, order:['createdAt'], raw: true})
	var page='report';
	res.render('report/report', {layout: 'admin', page, invoices, orders, users});
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

router.get('/create_admin', ensureAuthenticated, (req, res) => {
	var page = 'users';
	res.render('user/admin/creation', { layout: 'admin', page });
});

router.post('/create_admin', async function (req, res) { //this is to get the input of the page, req is to get what the user input
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
		res.render('user/admin/creation', {
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
			res.render('user/admin/creation', {
				name, email, mobile, postal, address, username
			}, { layout: 'main' });
		}
		else if (user) {
			// If user is found, that means email has already been registered
			flashMessage(res, 'error', username + ' alreay registered');
			res.render('user/admin/creation', {
				name, email, mobile, postal, address, username
			}, { layout: 'main' });
		}
		else {
			// Create new user record
			var salt = bcrypt.genSaltSync(10);
			var hash = bcrypt.hashSync(password, salt);
			// Use hashed password
			let member = 'admin';
			let user = await User.create({ name, email, gender, password: hash,member, mobile, postal, address, username });
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

module.exports = router;