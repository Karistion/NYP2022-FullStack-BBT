const express = require('express');
const res = require('express/lib/response');
const router = express.Router();
const flashMessage = require('../../helpers/messenger');
var Luhn = require('luhn-js');
const Invoice = require('../../models/Invoice');
const Cart = require('../../models/Cart');
const ensureAuthenticated = require('../../helpers/auth');

router.get('/checkout', ensureAuthenticated, (req, res) => {
    Cart.findFirst({
        where: { userId: req.user.id },
        order: [['updatedAt', 'DESC']],
        raw: true
        })
        .then((cart) => {
        res.render('invoice/customer/checkout', {layout: 'main'}, { cart });
        })
        .catch(err => console.log(err));
});

router.post('/checkout', async function (req, res) {
	let { card_number, card_name, expiry_date, cvv } = req.body;
	isValid=true;
	if (!Luhn.isValid(card_number)) {
        flashMessage(res, 'error', 'Invalid Card Number');
        isValid = false;
    }
    if (!isValid) {
        res.render('invoice/customer/checkout', {
            card_number, card_name, expiry_date, cvv
        }, {layout: 'main'});
        return;
    }
    let userId=req.user.id;
	Invoice.create({ card_number, card_name, postal_code, address, userId })
    .then((invoice)=>{ 
        console.log(invoice.toJSON());  
	    res.redirect('/invoice/cfmorder');
    })
});

router.get('/cart', ensureAuthenticated, (req, res) => {
    let cart=Cart.getCart();
	res.render('invoice/customer/cart', {layout: 'main'}, { cart });
});

router.get('/cfmorder', ensureAuthenticated, (req, res) => {
    Invoice.findFirst({
        where: { userId: req.user.id },
        order: [['datedelivered']],
        raw: true
        })
        .then((invoice) => {
        // pass object to listVideos.handlebar
        res.render('invoice/customer/cfmorder', {layout: 'main'}, { invoice });
        })
        .catch(err => console.log(err));
});

router.get('/order_history', ensureAuthenticated, (req, res) => {
    Invoice.findAll({
        where: { userId: req.user.id },
        order: [['datedelivered', 'DESC']],
        raw: true
        })
        .then((invoices) => {
            count=invoices.length
        // pass object to listVideos.handlebar
        res.render('invoice/customer/order_history', {layout: 'main'}, { invoices, count });
        })
        .catch(err => console.log(err));
});

module.exports = router;
