const express = require('express');
const res = require('express/lib/response');
const router = express.Router();
const flashMessage = require('../../helpers/messenger');
const Cart = require('../../models/Cart');
const Cartitems = require('../../models/CartItems');
const ensureAuthenticated = require('../../helpers/auth');
const Drink = require('../../models/Drink');

router.get('/cart', ensureAuthenticated, (req, res) => {
	Cart.findOne({
		where: {userId:req.user.id},
		order: [['updatedAt', 'DESC']], 
		raw: true
	}).then((cart)=>{
		Cartitems.findAll({
			where: { cartId: cart.id },
			order: [['createdAt']],
			raw: true
		})
			.then(async function(items) {
				// pass object to listVideos.handlebar
				for (var i=0;i<items.length;i++){
					var drink=await Drink.findByPk(items[i].drinkId)
					items[i]['drink']=drink;
				}
				res.render('invoice/customer/cart', {layout: 'main', cart, items});
			})
			.catch(err => console.log(err));
	}).catch(err => console.log(err))
});

router.post('/addtocart/:id', ensureAuthenticated, (req, res) => {
	var userId=req.user.id;
	let { sugar, topping, quantity } = req.body; //password/password2 is from the input name in the html
	var cart = Cart.findOne({where: { userId:req.user.id },order: [['updatedAt', 'DESC']], raw: true}).catch(err => console.log(err));
	Cartitems.create( sugar, topping, quantity, req.params.id, cart.id );
	var drink = Drink.findByPk(req.params.id)
	var price = cart.totalprice + (drink.price*quantity);
	Cart.update(
        {
            userId, price
        },
        { where: { userId:req.user.id } }
    )
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
		Cartitems.destroy({ where: { id: cartitems.id } });
		res.redirect(req.get('referer'));
		}
		catch (err) {
			console.log(err);	
		}
});

module.exports = router;