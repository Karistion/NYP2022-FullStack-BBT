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
const Voucher = require('../../models/Vouchers');
const ensureAuthenticated = require('../../helpers/auth');
require('dotenv').config();
const sgMail = require('@sendgrid/mail');
const validate = require('validator');
const XLSX = require('xlsx');
const path = require('path');
const Stripe = require('stripe');
const stripe = Stripe('sk_test_51LUnCLKUrLH8IiDgCMoRLXtao9J89E8fZeU6HWOoG0MIjfHljm0q33PW7Ul5NoNqrVLDI9xBJ7hFxL9TWg9l3rTy002mIBI3Z0');

function sendEmail(toEmail, invoice) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const message = {
        to: toEmail,
        from: `BubbleT <${process.env.SENDGRID_SENDER_EMAIL}>`,
        subject: 'Order Purchase Confirmation',
        html: `Thank you purchasing from BubbleT.<br><br> Order ID is ${invoice.id}<br>You can use this to track your order in <a href="http://localhost:5000/tracking/tracking/${invoice.id}">here</a>`
    };
    // Returns the promise from SendGrid to the calling function
    return new Promise((resolve, reject) => {
        sgMail.send(message)
            .then(response => resolve(response))
            .catch(err => reject(err));
    });
}

function exportexcel(array, filename, res) {
    let array2 = [];
    // array.forEach(function(element){
    //     array2.push(element);
    // });
    for (var i = 0; i < array.length; i++) {
        array2.push(array[i]);
    }
    var userpath = path.dirname(__dirname).split("\\")
    userpath.splice(3)
    userpath = userpath.join("\\")
    const convertJsontoExcel =()=>{
        const workSheet = XLSX.utils.json_to_sheet(array2);
        const workBook = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(workBook,workSheet,'Users');
        //Generate Buffer
        XLSX.write(workBook,{bookType:'xlsx',type:'buffer'});
        //Binary String
        XLSX.write(workBook,{bookType:'xlsx',type:'binary'});
        XLSX.writeFile(workBook,`${userpath}/Downloads/${filename}.xlsx`);
    }
    convertJsontoExcel();
    flashMessage(res,'success','File has been downloaded.')
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
                if (items.length!=0){
                    for (var i=0;i<items.length;i++){
                        var drink=await Drink.findByPk(items[i].drinkId)
                        items[i]['drink']=drink;
                    }
                    User.findOne({
                        where: {id:req.user.id},
                        order: [['updatedAt', 'DESC']], 
                        raw: true
                    }).then(async(user)=>{
                        var voucher = await Voucher.findAll({
                            where: {status: 'Pending'}, 
                            raw:true
                        })
                        var page = 'checkout'
                        res.render('invoice/customer/checkout', {layout: 'main', items, user, voucher, page});
                    })
                }
                else{
                    flashMessage(res, 'error', 'There is no items in cart')
                    res.redirect('/cart/cart')
                }
            })
            .catch(err => console.log(err));
    }).catch(err => console.log(err))
});

router.post('/checkout', async function (req, res) {
	let { card_number, card_name, postal_code, address, expiry_date, cvv, voucher } = req.body;
	isValid=true;
    card_number=card_number.trim()
    var postal=postal_code;
	if (!Luhn.isValid(card_number)) {
        flashMessage(res, 'error', 'Invalid Card Number');
        isValid = false;
    }else if (!validate.isPostalCode(postal_code, 'SG')){
        flashMessage(res, 'error', 'Invalid Address');
        isValid = false;
    }
    if (!isValid) {
        res.render('invoice/customer/checkout', {
            card_number, card_name, expiry_date, cvv, voucher, layout: 'main'
        });
        return;
    }
    if (voucher!=0){
        var voucher1 = await Voucher.findByPk(voucher).Value;
    }else{
        voucher1=0;
    }
    let userId=req.user.id;
    var cart = await Cart.findOne({where: {userId: userId}, order: [['updatedAt', 'DESC']], raw: true});
    var cartId = cart.id
    var totalprice = parseFloat(cart.totalPrice)*parseFloat((100-parseInt(voucher1))/100);
    User.update(
        { loyalty: req.user.loyalty + cart.totalPrice/50},
        { where: { id: req.user.id } }
    )
    var type = 'credit card';
	var invoice = await Invoice.create({ type, card_number, card_name, postal, address, totalprice, userId, cartId })
    Cart.create({userId})
    sendEmail(req.user.email, invoice)
    .catch(err => {
        console.log(err);
        res.redirect('/');
    });
	res.redirect('/invoice/cfmorder/'+invoice.id);
});

router.get('/ewallet', ensureAuthenticated, (req, res) => {
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
                if (items.length!=0){
                    for (var i=0;i<items.length;i++){
                        var drink=await Drink.findByPk(items[i].drinkId)
                        items[i]['drink']=drink;
                    }
                    User.findOne({
                        where: {id:req.user.id},
                        order: [['updatedAt', 'DESC']], 
                        raw: true
                    }).then(async(user)=>{
                        var voucher = await Voucher.findAll({
                            where: {status: 'Pending'}, 
                            raw:true
                        })
                        var page = 'ewallet'
                        res.render('invoice/customer/checkout', {layout: 'main', items, user, voucher, page});
                    })
                }
                else{
                    flashMessage(res, 'error', 'There is no items in cart')
                    res.redirect('/cart/cart')
                }
            })
            .catch(err => console.log(err));
    }).catch(err => console.log(err))
});

router.post('/ewallet', async function (req, res) {
	let { postal_code, address, voucher } = req.body;
	isValid=true;
    var postal=postal_code;
    if (!validate.isPostalCode(postal_code, 'SG')){
        flashMessage(res, 'error', 'Invalid Address');
        isValid = false;
    }
    if (!isValid) {
        res.render('invoice/customer/ewallet', {
            voucher, layout: 'main'
        });
        return;
    }
    if (voucher!=0){
        var voucher1 = await Voucher.findByPk(voucher).Value;
    }else{
        voucher1=0;
    }
    let userId=req.user.id;
    var cart = await Cart.findOne({where: {userId: userId}, order: [['updatedAt', 'DESC']], raw: true});
    var cartId = cart.id
    var totalprice = parseFloat(cart.totalPrice)*0.95*parseFloat((100-parseInt(voucher1))/100);
    User.update(
        { wallet: req.user.wallet - totalprice},
        { where: { id: req.user.id } }
    )
    var card_name=req.user.name;
    var card_number=0;
    var type = 'ewallet';
	var invoice = await Invoice.create({ type, card_number, card_name, postal, address, totalprice, userId, cartId })
    Cart.create({userId})
    sendEmail(req.user.email, invoice)
    .catch(err => {
        console.log(err);
        res.redirect('/');
    });
	res.redirect('/invoice/cfmorder/'+invoice.id);
});

router.get('/cfmorder/:id', ensureAuthenticated, (req, res) => {
    Invoice.findOne({
        where: { id: req.params.id },
        order: [['createdAt', 'DESC']],
        raw: true
        })
        .then((invoice) => {
            Cart.findOne({
                where: {id:invoice.cartId},
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
                        invoice['items']=items
                        res.render('invoice/customer/cfmorder', {layout: 'main', invoice});
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

router.get('/exportinvoicelist', ensureAuthenticated, async function(req, res){
    let array = await Invoice.findAll({
        where: {delivered:1},
        order: [['id']],
        raw: true
    });
    exportexcel(array, 'invoicelist', res);
    res.redirect('/invoice/invoicelist');
});

router.get('/exportorderlist', ensureAuthenticated, async function(req, res){
    let array = await Invoice.findAll({
        where: {delivered:0},
        order: [['id']],
        raw: true
    });
    exportexcel(array, 'orderlist', res)
    res.redirect('/invoice/orderlist');
});

module.exports = router;
