const Sequelize = require('sequelize');
const db = require('../config/DBConfig');
// Create users table in MySQL Database
const Threads = db.define('Threads',
{
    thread_ID:{ type: Sequelize.INTEGER },
    thread_Title:{ type: Sequelize.STRING },
    thread_Content:{ type: Sequelize.STRING },
    username:{ type: Sequelize.STRING },



});
module.exports = Threads;