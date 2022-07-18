const express = require('express');
const res = require('express/lib/response');
const router = express.Router();
const flashMessage = require('../../helpers/messenger');
const ensureAuthenticated = require('../../helpers/auth');

router.get('/report', ensureAuthenticated, (req, res) => {
	var page='report';
	res.render('report/report', {layout: 'admin', page});
});

module.exports = router;