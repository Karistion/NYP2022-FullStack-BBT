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

router.post('/addtocart/:id', ensureAuthenticated, async (req, res) => {
	var userId=req.user.id;
	let { sugar, topping, ice, quantity } = req.body; //password/password2 is from the input name in the html
	var cart = await Cart.findOne({where: { userId:req.user.id },order: [['updatedAt', 'DESC']], raw: true}).catch(err => console.log(err));
	var drink = await Drink.findByPk(req.params.id);
	var drinkId=drink.id
	var cartId=cart.id
	var price = parseFloat(drink.price);
	if (topping=='Brown Sugar Pearl'){
		price +=0.5;
	}else if (topping=='Aloe Vera Cubes'){
		price +=1.5;
	}else if (topping=='White Pearl'){
		price +=0.75;
	}else if (topping=='Konjac Jelly'){
		price +=1.0;
	}
	if (ice=='No'){
		price +=1.0;
	}else if (ice=='Less'){
		price +=0.5;
	}else if (ice=='More'){
		price +=0.5;
	}
	Cartitems.create({ sugar, topping, ice, quantity, price, drinkId, cartId });
	price *= quantity;
	price += parseFloat(cart.totalPrice);
	Cart.update(
        {
            totalPrice:price
        },
        { where: { id:cart.id } }
    )
	res.redirect(req.get('referer'));
});

router.get('/addtocart/:id', ensureAuthenticated, async (req, res) => {
	try{
	// var drink = await Drink.findByPk(req.drink.id);
	res.render('tempform', {layout:'main'})
	}
	catch (err) {
		console.log(err);	
	}
});

router.get('/deletecart/:id', ensureAuthenticated, async function(req, res) {
	try {
		let cartitems = await Cartitems.findByPk(req.params.id);
		if (!cartitems ) {
			flashMessage(res, 'error', 'Video not found');
			res.redirect(req.get('referer'));
			return;
		}
		var cart = await Cart.findOne({where: { userId:req.user.id },order: [['updatedAt', 'DESC']], raw: true}).catch(err => console.log(err));
		var drink = await Drink.findByPk(cartitems.drinkId);
		var price = parseFloat(cart.totalPrice) - parseFloat(cartitems.price);
		Cart.update(
			{
				totalPrice:price
			},
			{ where: { id:cart.id } }
		)
		Cartitems.destroy({ where: { id: cartitems.id } });
		res.redirect(req.get('referer'));
		}
		catch (err) {
			console.log(err);	
		}
});

module.exports = router;