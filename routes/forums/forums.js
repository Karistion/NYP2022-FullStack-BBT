const express = require('express');
const router = express.Router();
router.get('/forums', (req, res) => {
	res.render('forums\customer\homeforums', {layout: 'main'});
});

module.exports = router;