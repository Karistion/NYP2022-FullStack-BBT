const express = require('express');
const res = require('express/lib/response');
const router = express.Router();
const flashMessage = require('../../helpers/messenger');
var Luhn = require('luhn-js');
const Invoice = require('../../models/Invoice');
const Cart = require('../../models/Cart');
const Cartitems = require('../../models/CartItems');
const ensureAuthenticated = require('../../helpers/auth');

router.get('/checkout', ensureAuthenticated, (req, res) => {
    Cartitems.findAll({
        where: { cartId: Cart.findFirst({order: [['updatedAt', 'DESC']], raw: true}).catch(err => console.log(err)) },
        order: [['createdAt', 'DESC']],
        raw: true
    })
        .then((items) => {
            // pass object to listVideos.handlebar
			res.render('invoice/customer/checkout', {layout: 'main', items});
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
            card_number, card_name, expiry_date, cvv, layout: 'main'
        });
        return;
    }
    let userId=req.user.id;
    var CartId = Cart.findFirst({order: [['updatedAt', 'DESC']], raw: true}).catch(err => console.log(err))
	Invoice.create({ card_number, card_name, postal_code, address, userId, CartId })
    .then((invoice)=>{ 
        console.log(invoice.toJSON());  
	    res.redirect('/invoice/cfmorder');
    })
});



router.get('/cfmorder', ensureAuthenticated, (req, res) => {
    Invoice.findFirst({
        where: { userId: req.user.id },
        order: [['createdAt', 'DESC']],
        raw: true
        })
        .then((invoice) => {
        // pass object to listVideos.handlebar
        res.render('invoice/customer/cfmorder', {layout: 'main', invoice});
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
            res.render('invoice/customer/order_history', {layout: 'main', invoices, count });
        })
        .catch(err => console.log(err));
});

module.exports = router;
