const express = require('express');
const res = require('express/lib/response');
const router = express.Router();
const flashMessage = require('../../helpers/messenger');
const Cart = require('../../models/Cart');
const Cartitems = require('../../models/CartItems');
const ensureAuthenticated = require('../../helpers/auth');

router.get('/cart', ensureAuthenticated, (req, res) => {
    Cartitems.findAll({
        where: { cartId: Cart.findFirst({order: [['updatedAt', 'DESC']], raw: true}).catch(err => console.log(err)) },
        order: [['createdAt']],
        raw: true
    })
        .then((items) => {
            // pass object to listVideos.handlebar
			res.render('invoice/customer/cart', {layout: 'main', items});
        })
        .catch(err => console.log(err));
});

router.post('/addtocart/:id', ensureAuthenticated, (req, res) => {
	let { sugar, topping, quantity } = req.body; //password/password2 is from the input name in the html
	var cartId=Cart.findFirst({order: [['updatedAt', 'DESC']], raw: true}).catch(err => console.log(err));
	Cartitems.create( sugar, topping, quantity, req.params.id, cartId );
	res.redirect(req.get('referer'));
});

router.get('/deletecart/:id', ensureAuthenticated, async function(req, res) {
	try {
		let cartitems = await Cartitems.findByPk(req.params.id);
		if (!cartitems ) {
			flashMessage(res, 'error', 'Video not found');
			res.redirect(req.get('referer'));
			return;
		}
		let result = await Cartitems.destroy({ where: { id: cartitems.id } });
		res.redirect(req.get('referer'));
		}
		catch (err) {
			console.log(err);	
		}
});

module.exports = router;