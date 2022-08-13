const Sequelize = require('sequelize');
const db = require('../config/DBConfig');
// Create users table in MySQL Database
const ThreadReport = db.define('tReport',
{
    
    type:{ type: Sequelize.STRING },
    description:{ type: Sequelize.STRING },
    
    // dateCreated:{ type: Sequelize.DATE },


});
module.exports = ThreadReport;