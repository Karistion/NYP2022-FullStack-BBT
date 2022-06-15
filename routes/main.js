const express = require('express');
const res = require('express/lib/response');
const router = express.Router();
const flashMessage = require('../helpers/messenger');

router.get('/', (req, res) => {
	const title = 'Video Jotter';
	// renders views/index.handlebars, passing title as an object
	res.render('index', { title: title }) // why only write index? left title is handlebar while right one is const from js
});

router.get('/about', (req, res) => {
	const author = 'Jordan';
	res.render('about', {layout: 'main'});
});

router.post('/flash', (req, res) => {
	const message = 'This is an important message';
	const error = 'This is an error message';
	const error2 = 'This is the second error message';
	// req.flash('message', message);
	// req.flash('error', error);
	// req.flash('error', error2);


flashMessage(res, 'success', message);
flashMessage(res, 'info', message);
flashMessage(res, 'error', error);
flashMessage(res, 'error', error2, 'fas fa-sign-in-alt', true);
	res.redirect('/about');
	});
	
module.exports = router;
