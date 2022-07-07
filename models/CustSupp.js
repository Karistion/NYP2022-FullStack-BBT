const Sequelize = require('sequelize');
const db = require('../config/DBConfig');
// Create users table in MySQL Database
const Threads = db.define('threads',
{
    
    thread_Title:{ type: Sequelize.STRING },
    thread_Content:{ type: Sequelize.STRING },
    //thread_Username:{ type: Sequelize.STRING },
    //dateCreated:{ type: Sequelize.DATE },


});
module.exports = Threads;