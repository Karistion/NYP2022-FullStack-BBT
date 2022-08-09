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
		if (invoice.userId==req.user.id){
			res.render('tracking/tracking', {layout: 'main', invoice});
		}else{
			flashMessage(res, 'error', 'Unauthorised access');
			res.redirect('/tracking/tracking');
			return
		}
	}).catch(err => console.log(err));
});

router.get('/tracking', async(req, res) => {
	var invoice = await Invoice.findAll({
		where: {userId: req.user.id, delivered: 0}, 
		raw: true
	})
	res.render('tracking/trackingid', {layout: 'main', invoice});
});

router.post('/tracking', (req, res) => {
	let { orderid } = req.body;
	res.redirect('/tracking/tracking/'+orderid);
});

module.exports = router;