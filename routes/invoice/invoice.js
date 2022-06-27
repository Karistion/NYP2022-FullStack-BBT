const express = require('express');
const res = require('express/lib/response');
const router = express.Router();
const flashMessage = require('../../helpers/messenger');
var Luhn = require('luhn-js');
const Invoice = require('../../models/Invoice');
const Cart = require('../../models/Cart');
const Drink = require('../../models/Drink');
const Cartitems = require('../../models/CartItems');
const User = require('../../models/User');
const ensureAuthenticated = require('../../helpers/auth');

router.get('/checkout', ensureAuthenticated, (req, res) => {
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
                User.findOne({
                    where: {id:req.user.id},
                    order: [['updatedAt', 'DESC']], 
                    raw: true
                }).then((user)=>{
                    res.render('invoice/customer/checkout', {layout: 'main', items, user});
                })
            })
            .catch(err => console.log(err));
    }).catch(err => console.log(err))
});

router.post('/checkout', async function (req, res) {
	let { card_number, card_name, postal_code, address, expiry_date, cvv } = req.body;
	isValid=true;
	if (!Luhn.isValid(card_number)) {
        flashMessage(res, 'error', 'Invalid Card Number');
        isValid = false;
    }
    if (!isValid) {
        res.render('invoice/customer/checkout', {
            card_number, card_name, expiry_date, cvv, layout: 'main'
        });
        return;
    }
    let userId=req.user.id;
    var cart = Cart.findOne({where: {userId: userId}, order: [['updatedAt', 'DESC']], raw: true});
    var CartId = cart.id
    var cartprice = cart.totalPrice;
	Invoice.create({ card_number, card_name, postal_code, address, cartprice, userId, CartId })
    Cart.create({userId})
	res.redirect('/invoice/cfmorder');
});



router.get('/cfmorder', ensureAuthenticated, (req, res) => {
    Invoice.findOne({
        where: { userId: req.user.id },
        order: [['createdAt', 'DESC']],
        raw: true
        })
        .then((invoice) => {
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
                        res.render('invoice/customer/cfmorder', {layout: 'main', invoice, items});
                    })
                    .catch(err => console.log(err));
            }).catch(err => console.log(err))
        // pass object to listVideos.handlebar
        })
        .catch(err => console.log(err));
});

router.get('/order_history', ensureAuthenticated, (req, res) => {
    Invoice.findAll({
        where: { userId: req.user.id },
        order: [['datedelivery', 'DESC']],
        raw: true
        })
        .then((invoice) => {
            Cart.findOne({
                where: {userId:req.user.id},
                order: [['updatedAt']], 
                raw: true
            }).then((cart)=>{
                Cartitems.findAll({
                    where: { CartId: cart.id },
                    order: [['createdAt']],
                    raw: true
                })
                    .then(async function(items) {
                        var count=0;
                        // pass object to listVideos.handlebar
                        for (var i=0;i<items.length;i++){
                            var drink=await Drink.findByPk(items[i].drinkId)
                            items[i]['drink']=drink;
                        }
                        for (var i=0;i<invoice.length;i++){
                            if (invoice.cartId==items[i]['drink'].cartId){
                                invoice[i]['items']=items;
                            }
                            if (!invoice.delivered){
                                count++;
                            }
                        }
                        res.render('invoice/customer/order_history', {layout: 'main', invoice, count});
                    })
                    .catch(err => console.log(err));
            }).catch(err => console.log(err))
        // pass object to listVideos.handlebar
        })
        .catch(err => console.log(err));
});

module.exports = router;
