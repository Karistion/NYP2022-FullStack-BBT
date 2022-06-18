const express = require('express');
const res = require('express/lib/response');
const router = express.Router();
const flashMessage = require('../../helpers/messenger');
// const Invoice = require('../../models/Invoice');

router.get('/checkout', (req, res) => {
	res.render('invoice/customer/checkout', {layout: 'main'});
});

module.exports = router;
