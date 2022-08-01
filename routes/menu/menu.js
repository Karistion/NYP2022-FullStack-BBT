const express = require('express');
const res = require('express/lib/response');
const router = express.Router();
const flashMessage = require('../../helpers/messenger');
const Drink = require('../../models/Drink');
const ensureAuthenticated = require('../../helpers/auth');

// CUSTOMER SIDE
router.get('/menu', (req, res) => {
	res.render('menu/customer/menu', {layout: 'main'});
});

router.get('/category/:category', async (req, res) => {
	var category=req.params.category;
	var drink = await Drink.findAll({where: {category: category}, order: [['name']], raw: true});
	res.render('menu/customer/category', {layout: 'main', drink});
});

// ADMIN SIDE
router.get('/adminmenu', ensureAuthenticated, async (req, res) => {
	var page='menuchange';
	var category=req.params.category;
	var drink = await Drink.findAll({order: [['category']], raw: true});
	res.render('menu/admin/drink', {layout: 'admin', page, drink});
});

router.get('/AddDrinks', ensureAuthenticated, async (req, res) => { 
    res.render('menu/admin/add_drinks', { layout: 'admin' });
});


module.exports = router;