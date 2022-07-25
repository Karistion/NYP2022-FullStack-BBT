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
require('dotenv').config();
const sgMail = require('@sendgrid/mail');

function sendEmail(toEmail, invoice) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const message = {
        to: toEmail,
        from: `BubbleT <${process.env.SENDGRID_SENDER_EMAIL}>`,
        subject: 'Order Purchase',
        html: `Thank you purchasing from BubbleT.<br><br> Order ID is ${invoice.id}<br>You can use this to track your order in <a href="http://localhost:5000/tracking/tracking/${invoice.id}"`
    };
    // Returns the promise from SendGrid to the calling function
    return new Promise((resolve, reject) => {
        sgMail.send(message)
            .then(response => resolve(response))
            .catch(err => reject(err));
    });
}

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

router.get('/orderlist', ensureAuthenticated, async function(req, res) {
    var invoices= await Invoice.findAll({where: {delivered:0}, order:['createdAt'], raw: true})
    var page='orderlist';
	res.render('invoice/admin/order_list', {layout: 'admin', invoices, page});
});

router.get('/updateinvoice/:id', ensureAuthenticated, async function(req, res) {
    var invoice= await Invoice.findByPk(req.params.id)
    invoice['cart']= await Cart.findOne({
        where: {id:invoice.cartId},
        order: [['updatedAt']], 
        raw: true
    }).catch(err => console.log(err));
    invoice['items'] = await Cartitems.findAll({
        where: { CartId: invoice['cart'].id },
        order: [['createdAt']],
        raw: true
    }).catch(err => console.log(err));
    for (var j=0; j<invoice['items'].length; j++){
        var drink=await Drink.findByPk(invoice['items'][j].drinkId)
        invoice['items'][j]['drink']=drink;
    }
    var page='orderlist';
	res.render('invoice/admin/updateorderstatus', {layout: 'admin', invoice, page});
});

router.get('/minusstatus/:id', ensureAuthenticated, async function(req, res) {
    var invoice= await Invoice.findByPk(req.params.id)
    Invoice.update(
        { status: invoice.status-1 },
        { where: { id: req.params.id } }
      )
    res.redirect('/invoice/updateinvoice/'+req.params.id)
});

router.get('/plusstatus/:id', ensureAuthenticated, async function(req, res) {
    var invoice= await Invoice.findByPk(req.params.id)
    Invoice.update(
        { status: invoice.status+1 },
        { where: { id: req.params.id } }
      )
    res.redirect('/invoice/updateinvoice/'+req.params.id)
});

router.get('/delivered/:id', ensureAuthenticated, async function(req, res) {
    Invoice.update(
        { delivered: 1 },
        { where: { id: req.params.id } }
      )
    res.redirect('/invoice/orderlist')
});

router.get('/invoicelist', ensureAuthenticated, async function(req, res) {
    var invoices= await Invoice.findAll({where: {delivered:1}, order:['createdAt'], raw: true})
    var page='invoicelist';
	res.render('invoice/admin/order_list', {layout: 'admin', invoices, page});
});

module.exports = router;
