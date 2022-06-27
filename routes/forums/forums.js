const express = require('express');
const res = require('express/lib/response');
const Threads = require('../../models/CustSupp');
const router = express.Router();
const moment = require('moment');
const User = require('../../models/User');


router.get('/forums', (req, res) => {
	Threads.findAll({
        
        //order: [['dateRelease', 'DESC']],
        //raw: true
    })
        .then((threads) => {
            // pass object to listVideos.handlebar
            
            res.render('forums/customer/homeforums', { threads, layout: 'main' });
        })
        .catch(err => console.log(err));
});

router.get('/CreateThread', (req, res) => { //this is to render the page
    res.render('forums/customer/createforums', { layout: 'main' });
});

router.get('/ViewThread/:id', (req, res) => { //this is to render the page
    Threads.findByPk(req.params.id).then((thread)=>{
        User.findOne({
            where: {id:thread.userId}
        }).then((user)=>{
            res.render('forums/customer/viewforums', { layout: 'main', Thread });
        })
        })
        .catch(err => console.log(err)); 
});



router.get('/UpdateThread/:id', (req, res) => { //this is to render the page
    
    Threads.findByPk(req.params.id) //this part is we get the id from the database using findbypk. then we get the whole video object
        .then((Thread) => {
            res.render('forums/customer/updateforums', { layout: 'main', Thread });
        })
        .catch(err => console.log(err));
});

router.post('/CreateThread', async function (req, res) { //this is to get the input of the page, req is to get what the user input
    let thread_Title = req.body.thread_Title;
    let thread_Content = req.body.thread_Content.slice(0, 1999);
    let dateCreated = moment(req.body.dateRelease, 'DD/MM/YYYY');

    var userId=req.user.id
    Threads.create(
        {
            thread_Title, thread_Content, dateCreated, userId
        }
    )
        .then((Thread) => {
            console.log(Thread.toJSON());
            res.redirect('/');
        })
        .catch(err => console.log(err))
});

module.exports = router;