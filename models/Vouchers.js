const Sequelize = require('sequelize');
const db = require('../config/DBConfig');
// Create users table in MySQL Database
const Vouchers = db.define('Vouchers',
{
    Voucher_Name:{ type: Sequelize.STRING },
    Created_By:{ type: Sequelize.STRING },
    Description:{ type: Sequelize.STRING },
    Status:{ type: Sequelize.STRING },
    Value:{ type: Sequelize.INTEGER },


});
module.exports = Vouchers;