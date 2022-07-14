const express = require('express');
const res = require('express/lib/response');
const router = express.Router();
const flashMessage = require('../../helpers/messenger');
const Drink = require('../../models/Drink');

router.get('/menu', (req, res) => {
	res.render('menu/customer/menu', {layout: 'main'});
});

router.get('/category/:category', (req, res) => {
	var category=req.params.category;
	res.render('menu/customer/category', {layout: 'main'});
});

module.exports = router;