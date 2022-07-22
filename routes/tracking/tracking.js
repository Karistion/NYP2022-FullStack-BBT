const express = require('express');
const res = require('express/lib/response');
const router = express.Router();
const flashMessage = require('../../helpers/messenger');
const Cart = require('../../models/Cart');
const Cartitems = require('../../models/CartItems');
const ensureAuthenticated = require('../../helpers/auth');
const Drink = require('../../models/Drink');
const Invoice = require('../../models/Invoice');

router.get('/tracking/:id', (req, res) => {
	Invoice.findByPk(req.params.id).then((invoice)=>{
		res.render('tracking/tracking', {layout: 'main', invoice});
	}).catch(err => console.log(err));
});

module.exports = router;