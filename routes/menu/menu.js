const express = require('express');
const res = require('express/lib/response');
const router = express.Router();
const Drink = require('../../models/Drink');

router.get('/menu', (req, res) => {
	res.render('menu/customer/menu', {layout: 'main'});
});

module.exports = router;