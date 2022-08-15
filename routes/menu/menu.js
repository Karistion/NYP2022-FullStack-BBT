const express = require('express');
const res = require('express/lib/response');
const router = express.Router();
const moment = require('moment');
const flashMessage = require('../../helpers/messenger');
const Drink = require('../../models/Drink');
const Cart = require('../../models/Cart');
const Cartitems = require('../../models/CartItems');
const ensureAuthenticated = require('../../helpers/auth');

// CUSTOMER SIDE

//menu
router.get('/menu', (req, res) => {
	res.render('menu/customer/menu', {layout: 'main'});
});
//menu category
router.get('/category/:category', async (req, res) => {
	var category=req.params.category;
	var drink = await Drink.findAll({where: {category: category}, order: [['name']], raw: true});
	res.render('menu/customer/category', {layout: 'main', drink});
});

// ADMIN SIDE

//admin drink list
router.get('/adminmenu', ensureAuthenticated, async (req, res) => {
	var page='menuchange';
	var category=req.params.category;
	var drink = await Drink.findAll({order: [['category']], raw: true});
	res.render('menu/admin/drink_list', {layout: 'admin', page, drink});
});
//admin drink options - placeholder

// router.get('/adminmenu2', ensureAuthenticated, async (req, res) => {
// 	var page='optionchange';
// 	var topping=req.params.topping;
// 	var CartItems = await Cartitems.findAll({order: [['topping']], raw: true});
// 	res.render('menu/admin/drink_options', {layout: 'admin', page, CartItems});
// });


//admin add drinks from drink list
router.get('/AddDrinks', ensureAuthenticated, async (req, res) => { 
    res.render('menu/admin/add_drinks', { layout: 'admin' });
});
//admin add drinks from drink list function
router.post('/AddDrinks', ensureAuthenticated, async (req, res) => { 
    var name = req.body.name;
	var price = req.body.price;
	var category = req.body.category;
    var desc = req.body.desc;
    var dateCreated = moment(req.body.dateRelease, 'DD/MM/YYYY');

	Drink.create(
        {
            name, price, category, desc, dateCreated
        }
    )
        .then((Drink) => {
            console.log(Drink.toJSON());
            res.redirect('/menu/adminmenu');
        })
        .catch(err => console.log(err))
});
//admin edit drinks from drink list
router.get('/EditDrinks/:id',ensureAuthenticated, async (req, res) => { //this is to render the page
    var drink = await Drink.findByPk(req.params.id);
	res.render('menu/admin/edit_drinks', { layout: 'admin', drink});
});
//admin edit drinks from drink list function
router.post('/EditDrinks/:id', ensureAuthenticated, async (req, res) => {
	var name = req.body.name;
	var price = req.body.price;
	var category = req.body.category;
    var desc = req.body.desc;

    Drink.update(
        {
			name, price, category, desc
        },
        { where: { id: req.params.id } }
    )
        .then((result) => {
            console.log(result[0] + ' drink updated');
            res.redirect('/menu/adminmenu');
        })
        .catch(err => console.log(err));
});
//admin delete drinks from drink list inside drink list page
router.get('/DeleteDrinks/:id', ensureAuthenticated, async function(req, res) {
	try {
		
		let result = await Drink.destroy({ where: { id: req.params.id } });
		res.redirect('/menu/adminmenu');
		}
		catch (err) {
			console.log(err);	
		}
});

module.exports = router;