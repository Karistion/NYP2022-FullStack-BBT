const express = require('express');
const res = require('express/lib/response');
const Threads = require('../../models/CustSupp');
const router = express.Router();
const moment = require('moment');
const User = require('../../models/User');
const ensureAuthenticated = require('../../helpers/auth');
const Comments = require('../../models/Comments');
const { get } = require('express/lib/response');
const ThreadReport = require('../../models/ThreadReport');
const ensureAdmin = require('../../helpers/admin');


router.get('/forums', (req, res) => {
	Threads.findAll({
        
        order: [['createdAt', 'DESC']],
        //raw: true
    })
        .then((threads) => {
            // pass object to listVideos.handlebar
            
            res.render('forums/customer/homeforums', { threads, layout: 'main' });
        })
        .catch(err => console.log(err));
});

router.get('/CreateThread',(req, res) => { //this is to render the page
    res.render('forums/customer/createforums', { layout: 'main' });
});

router.get('/ViewThread/:id',async function (req, res)  { //this is to render the page
    var Thread = await Threads.findByPk(req.params.id, {
        include:[{model:User,required:true}]
    });
    var comments = await Comments.findAll({
        where:{ threadId:Thread.id},
        include:[{model: User, required:true}]
    })
    console.log(Thread);
    res.render('forums/customer/viewforums', { layout: 'main', Thread, comments });
});

router.get('/UpdateThread/:id', async function (req, res)  { //this is to render the page
    var Thread = await Threads.findByPk(req.params.id);
    User.findOne({
        where: {id:Thread.userId}
    }).then((user)=>{
        res.render('forums/customer/updateforums', { layout: 'main', Thread, user });
    })
    .catch(err => console.log(err)); 
});

router.post('/UpdateThread/:id', ensureAuthenticated, (req, res) => {
    let thread_Title = req.body.thread_Title;
    let thread_Content = req.body.thread_Content.slice(0, 1999);
    
    Threads.update(
        {
            thread_Title, thread_Content
        },
        { where: { id: req.params.id } }
        
    )
        .then((result) => {
            console.log(result[0] + ' thread updated');
            res.redirect('/forums/forums');
        })
        .catch(err => console.log(err));
});

router.get('/DeleteThread/:id', ensureAuthenticated, async function(req, res) {
	try {
		
		let result2 = await ThreadReport.destroy({ where: { threadId: req.params.id } });
		let result = await Threads.destroy({ where: { id: req.params.id } });
        
		res.redirect('/forums/forums');
		}
		catch (err) {
			console.log(err);	
		}
});



router.post('/CreateThread', ensureAuthenticated, async function (req, res) { //this is to get the input of the page, req is to get what the user input
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
            res.redirect('/forums/forums');
        })
        .catch(err => console.log(err))
});



router.post('/ViewThread/:id', ensureAuthenticated, async function (req, res) { //this is to get the input of the page, req is to get what the user input
    let comment_Content = req.body.comment_Content;
    let report_Comment = false;
    
    var threadId = req.params.id;
    var userId=req.user.id;

    Comments.create(
        {
            comment_Content, threadId, userId
        }
    )
        Comments.findOne({
        where: {threadId:threadId},
        include: [{
            model: User,
            required: true
        }]
        })
        .then((Comment) => {
            res.redirect('/forums/ViewThread/'+ threadId)
            
        })
        .catch(err => console.log(err))
});

router.get('/CreateReport/:id',ensureAuthenticated, async function(req, res)  { //this is to render the page
    
    
    var userId =req.user.id
    User.findOne({
        where: {id:userId}
    }).then((user)=>{
        res.render('forums/customer/reportCreate', { layout: 'main',  user });
    })
    .catch(err => console.log(err)); 
});

router.post('/CreateReport/:id', ensureAuthenticated, async function (req, res) { //this is to get the input of the page, req is to get what the user input
    let type = req.body.type;
    let description = req.body.description;
    let threadId = req.params.id;
    let userId =req.user.id;
    
    

    ThreadReport.create(
        {
            type,description,threadId,userId
        }
        
    )
        .then((ThreadReport) => {
            res.redirect('/forums/forums')
            
        })
        .catch(err => console.log(err))
});

router.get('/ViewReport',ensureAdmin, (req, res) => { //this is to render the page
    
    // ThreadReport.findAll({
        
    //     order: [['createdAt', 'DESC']],
    //     include: [{
    //         model: User,
    //         required: true
    //     }]
       
    //     //raw: true
    // })
    //     .then((tReport) => {
    //         // pass object to listVideos.handlebar
    //         var page='tReport';
    //         res.render('forums/admin/reportView', { tReport, layout: 'admin', page});
            
    //     })
    //     .catch(err => console.log(err));  
    ThreadReport.findAll({
        
        order: [['updatedAt', 'DESC']], 
        raw: true
    }).then(async function(Thread){
        for (var i=0;i<Thread.length;i++){
            var thread=await Threads.findByPk(Thread[i].threadId)
            Thread[i]['thread']=thread;
            var user=await User.findByPk(thread.userId)
            Thread[i]['thread']['user']=user;
            var Reporteduser=await User.findByPk(Thread[i].userId)
            Thread[i]['Reporteduser']=Reporteduser;
        }
        
            //         // pass object to listVideos.handlebar
                    var page='tReport';
                    console.log(Thread)
                    res.render('forums/admin/reportView', { Thread, layout: 'admin', page});
                    
                })
        
        .catch(err => console.log(err))
            
    })


router.get('/DeleteReport/:id',ensureAdmin, ensureAuthenticated, async function(req, res) {
	try {
		
		
		let result = await ThreadReport.destroy({ where: { id: req.params.id } });
		res.redirect('/forums/ViewReport');
		}
		catch (err) {
			console.log(err);	
		}
});

router.get('/DeleteThreadAdmin/:id', ensureAuthenticated, async function(req, res) {
	try {
		
		let result2 = await ThreadReport.destroy({ where: { ThreadId: req.params.id } });
		let result = await Threads.destroy({ where: { id: req.params.id } });
        
		res.redirect('/forums/ViewReport');
		}
		catch (err) {
			console.log(err);	
		}
});
router.get('/ContactDetails',(req, res) => { //this is to render the page
    res.render('forums/customer/ContactDetails', { layout: 'main' });
});


module.exports = router;