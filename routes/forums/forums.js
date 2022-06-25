const express = require('express');
const res = require('express/lib/response');
const Threads = require('../../models/CustSupp');
const router = express.Router();
const moment = require('moment');

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

router.post('/CreateThread', async function (req, res) { //this is to get the input of the page, req is to get what the user input
    let thread_Title = req.body.thread_Title;
    let thread_Content = req.body.thread_Content.slice(0, 1999);
    let dateCreated = moment(req.body.dateRelease, 'DD/MM/YYYY');

    
    Threads.create(
        {
            thread_Title, thread_Content, dateCreated
        }
    )
        .then((Thread) => {
            console.log(Thread.toJSON());
            res.redirect('/');
        })
        .catch(err => console.log(err))
});

module.exports = router;