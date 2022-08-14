const express = require('express');
const res = require('express/lib/response');
const router = express.Router();
const moment = require('moment');
const flashMessage = require('../../helpers/messenger');
const ensureAuthenticated = require('../../helpers/auth');
const User = require('../../models/User');
const Invoice = require('../../models/Invoice');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const sgMail = require('@sendgrid/mail');
const sequelize = require('sequelize');
const Cartitems = require('../../models/CartItems');
const Drink = require('../../models/Drink');
const Op = sequelize.Op;
const fs = require('fs');
const upload = require('../../helpers/addImage');

function sendEmail(toEmail, url) {
	sgMail.setApiKey(process.env.SENDGRID_API_KEY);
	const message = {
		to: toEmail,
		from: `BubbleT <${process.env.SENDGRID_SENDER_EMAIL}>`,
		subject: 'Verify BubbleT Account',
		html: `Thank you registering with BubbleT.<br><br> Please
<a href=\"${url}"><strong>verify</strong></a> your account.`
	};
	// Returns the promise from SendGrid to the calling function
	return new Promise((resolve, reject) => {
		sgMail.send(message)
			.then(response => resolve(response))
			.catch(err => reject(err));
	});
}

router.get('/admin', ensureAuthenticated, async (req, res) => {
	var orders= await Invoice.findAll({where: {delivered:0}, order:['createdAt'], raw: true})
	var invoices= await Invoice.findAll({where: {delivered:1}, order:['createdAt'], raw: true})
	var users= await User.findAll({where: {member:'member'}, order:['createdAt'], raw: true})
	var revenue={};
	for (i=11;i>=0;i--){
		var sum=0;
		var invoice = await Invoice.findAll({where: {createdAt: {
			[Op.gte]: `2022-${moment().subtract(i, 'months').format('MM')}-02T00:00:00.000Z`,
      		[Op.lt]: `2022-${moment().subtract(i-1, 'months').format('MM')}-01T00:00:00.000Z`,
		  }}, order:['createdAt'], raw: true})
		for(x=0;x<invoice.length;x++){
			sum+=invoice[x]['totalprice'];
		}
		revenue[JSON.stringify(moment().subtract(i, 'months').format('MMMM YYYY'))] = sum;
	}
	var drink={"SignaT":0, "Macchiato":0,"Gtea":0, "Matcha":0, "Mtea":0, "Oolong":0};
	var item = await Cartitems.findAll({
		include: [{
		  model: Drink,
		  required: true
		 }]
	  });
	for (x=0;x<item.length;x++){
		drink[item[x]['drink']['category']]+=item[x]['quantity'];
	}
	var page='report';
	res.render('report/report', {layout: 'admin', page, invoices, orders, users, revenue, drink});
});

// router.get('/usertable', ensureAuthenticated, (req, res) => {
// 	var page = 'user';
// 	res.render('user/admin/usertable', { layout: 'admin', page });
// });

router.get('/listUsers', ensureAuthenticated, (req, res) => {
	User.findAll({
		order: [['id', 'ASC']],
		raw: true
	})
		.then((users) => {
			// pass object to listVideos.handlebar
			var page = 'users';
			res.render('user/admin/usertable', { layout: 'admin', page, users });
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
					flashMessage(res, 'success', user.username + ' registered successfully');
					res.redirect('/report/listUsers');
				})
				.catch(err => {
					console.log(err);
					flashMessage(res, 'error', 'Error when sending email to ' +
						user.email);
					res.redirect('/report/create_admin');
				});
		}
	}
	catch (err) {
		console.log(err);
	}
});

router.get('/adminProfile', ensureAuthenticated, (req, res) => {
	User.findByPk(req.user.id)
		.then((user) => {
			var page = 'users';
			res.render('user/customer/profile', { layout: 'admin', page, user });
		})
		.catch(err => console.log(err));
});

router.get('/updateAdmin', ensureAuthenticated, (req, res) => {
	User.findByPk(req.user.id)
		.then((user) => {
			var page = 'users';
			res.render('user/customer/editprofile', { layout: 'admin', page, user });
		})
		.catch(err => console.log(err));
});

router.post('/updateAdmin', ensureAuthenticated, async function (req, res) {
	let name = req.body.name;
	let username = req.body.username;
	let gender = req.body.gender;
	let mobile = req.body.mobile;
	let postal = req.body.postal;
	let address = req.body.address;
	let email = req.body.email;
	User.update(
		{
			name, username, gender, mobile, postal, address, email
		},
		{ where: { id: req.user.id } }
	)
		.then((result) => {
			console.log(result[0] + ' User updated');
			res.redirect('/report/adminProfile');
			// res.redirect(`/user/profile/${req.user.id}`);
		})
		.catch(err => console.log(err));
});

router.post('/adminProfile', ensureAuthenticated, (req, res) => {
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

router.post('/profileSaveAdmin/:id', ensureAuthenticated, async (req, res) => {
	let { posterURL, posterUpload } = req.body;
	console.log(posterURL);
	posterURL = posterURL.split("/")[3]
	// let image = `${req.file.filename}`
	await User.update({ image: posterURL }, { where: { id: req.user.id } });
	res.redirect(`/report/adminProfile`);
});

// router.get('/downloadExcel', exportUser)

module.exports = router;