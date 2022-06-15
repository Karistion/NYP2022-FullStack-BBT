const Sequelize = require('sequelize');
const db = require('../config/DBConfig');
// Create users table in MySQL Database
const User = db.define('user',
    {
        name: { type: Sequelize.STRING },
        mobile: { type: Sequelize.INTEGER },
        postal: { type: Sequelize.INTEGER },
        address: { type: Sequelize.STRING },
        email: { type: Sequelize.STRING },
        username: { type: Sequelize.STRING },
        password: { type: Sequelize.STRING },
    });
module.exports = User