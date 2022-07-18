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
    card_number=card_number.trim()
    var postal=postal_code;
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
    var cart = await Cart.findOne({where: {userId: userId}, order: [['updatedAt', 'DESC']], raw: true});
    var cartId = cart.id
    var totalprice = cart.totalPrice;
	Invoice.create({ card_number, card_name, postal, address, totalprice, userId, cartId })
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

router.get('/order_history', ensureAuthenticated, async function(req, res) {
    var invoices = await Invoice.findAll({
        where: { userId: req.user.id },
        order: [['datedelivery', 'DESC']],
        raw: true
        }).catch(err => console.log(err))
    var count=0;
    for (var i=0; i<invoices.length; i++){
        if (!invoices[i].delivered){
            count++;
        }
        invoices[i]['cart']= await Cart.findOne({
            where: {id:invoices[i].cartId},
            order: [['updatedAt']], 
            raw: true
        }).catch(err => console.log(err));
        invoices[i]['items'] = await Cartitems.findAll({
            where: { CartId: invoices[i]['cart'].id },
            order: [['createdAt']],
            raw: true
        }).catch(err => console.log(err));
        for (var j=0; j<invoices[i]['items'].length; j++){
            var drink=await Drink.findByPk(invoices[i]['items'][j].drinkId)
            invoices[i]['items'][j]['drink']=drink;
        }
    }
    res.render('invoice/customer/order_history', {layout: 'main', invoices, count});
                    
        // pass object to listVideos.handlebar
});

router.get('/invoicelist', ensureAuthenticated, async function(req, res) {
    var invoices= await Invoice.findAll({order:['createdAt'], raw: true})
	res.render('invoice/admin/invoice_list', {layout: 'admin', invoices});
});

router.get('/updateinvoice/:id', ensureAuthenticated, async function(req, res) {
    var invoice= await Invoice.findByPk(req.params.id)
	res.render('invoice/customer/cfmorder', {layout: 'admin', invoice});
});

module.exports = router;
