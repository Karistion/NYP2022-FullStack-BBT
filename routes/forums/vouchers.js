const express = require('express');
const res = require('express/lib/response');
const router = express.Router();
const moment = require('moment');
const ensureAuthenticated = require('../../helpers/auth');
const { get } = require('express/lib/response');
const Vouchers = require('../../models/Vouchers');

router.get('/vouchersView', ensureAuthenticated, (req, res) => {
	
    Vouchers.findAll({
        
        order: [['createdAt', 'DESC']],
        //raw: true
    })
        .then((vouchers) => {
            // pass object to listVideos.handlebar
            var page='voucher';
            res.render('forums/admin/vouchersView', { vouchers, layout: 'admin', page});
        })
        .catch(err => console.log(err));         
});

router.get('/vouchersCreate', (req, res) => { //this is to render the page
    var page='voucher';
    res.render('forums/admin/vouchersCreate', { layout: 'admin', page });
});

router.post('/vouchersCreate', ensureAuthenticated, async function (req, res) { //this is to get the input of the page, req is to get what the user input
    var Voucher_Name = req.body.Voucher_Name;
    
    var Description = req.body.Description;
    var Status = req.body.Status;
    var dateCreated = moment(req.body.dateRelease, 'DD/MM/YYYY');
    var Value = req.body.Value;
    
    var Created_By =req.user.id
    Vouchers.create(
        {
            Voucher_Name, Created_By, Description, Status, Value
            
        }
    )
        .then((Voucher) => {
            console.log(Voucher.toJSON());
            res.redirect('/vouchers/vouchersView');
        })
        .catch(err => console.log(err))
});


router.get('/vouchersEdit/:id',ensureAuthenticated, async function (req, res)  { //this is to render the page
    var Voucher = await Vouchers.findByPk(req.params.id);
    var page='voucher';
    // User.findOne({
    //     where: {id:Thread.userId}
    // }).then((user)=>{
    //     res.render('forums/admin/vouchersView', { layout: 'main', Thread, user });
    // })
    // .catch(err => console.log(err)); 
    res.render('forums/admin/vouchersEdit', { layout: 'admin', Voucher, page});
});


router.post('/vouchersEdit/:id', ensureAuthenticated, (req, res) => {
    var Voucher_Name = req.body.Voucher_Name;
    
    var Description = req.body.Description;
    var Status = req.body.Status;
    var Value = req.body.Value;

    Vouchers.update(
        {
            Voucher_Name, Description, Status, Value
        },
        { where: { id: req.params.id } }
    )
        .then((result) => {
            console.log(result[0] + ' vouchers updated');
            res.redirect('/vouchers/vouchersView');
        })
        .catch(err => console.log(err));
});

router.get('/vouchersDelete/:id', ensureAuthenticated, async function(req, res) {
	try {
		
		
		let result = await Vouchers.destroy({ where: { id: req.params.id } });
		res.redirect('/vouchers/vouchersView');
		}
		catch (err) {
			console.log(err);	
		}
});
module.exports = router;