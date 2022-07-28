const Sequelize = require('sequelize');
const db = require('../config/DBConfig');
// Create users table in MySQL Database
const Comments = db.define('comments',
{
    //Thread_id
    //comment_Title:{ type: Sequelize.STRING },
    comment_Content:{ type: Sequelize.STRING },
    //report_Comment:{ type: Sequelize.BOOLEAN },
    //comment_Username:{ type: Sequelize.STRING },
    //dateCreated:{ type: Sequelize.DATE },



});
module.exports = Comments;