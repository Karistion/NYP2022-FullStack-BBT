const express = require('express');
const res = require('express/lib/response');
const router = express.Router();
const flashMessage = require('../../helpers/messenger');
const Cart = require('../../models/Cart');
const Cartitems = require('../../models/CartItems');
const ensureAuthenticated = require('../../helpers/auth');
const Drink = require('../../models/Drink');

router.get('/tracking', (req, res) => {
	res.render('tracking/tracking', {layout: 'main'});
});

module.exports = router;