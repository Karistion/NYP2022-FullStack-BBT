const Sequelize = require('sequelize');
const db = require('../config/DBConfig');
// Create users table in MySQL Database
const User = db.define('user',
    {
        name: { type: Sequelize.STRING },
        mobile: { type: Sequelize.INTEGER },
        gender: { type: Sequelize.STRING },
        postal: { type: Sequelize.INTEGER },
        address: { type: Sequelize.STRING },
        email: { type: Sequelize.STRING },
        verified: { type: Sequelize.BOOLEAN },
        username: { type: Sequelize.STRING },
        password: { type: Sequelize.STRING },
        member: { type: Sequelize.STRING, defaultValue: 'member' },
        activity: { type: Sequelize.INTEGER, defaultValue: 1 },
        OTP: { type: Sequelize.STRING, defaultValue: null },
        appeal: { type: Sequelize.STRING, defaultValue:null },
        image: { type: Sequelize.STRING },
        wallet: { type: Sequelize.FLOAT(10,2), defaultValue: 0.00 },
        loyalty: { type: Sequelize.FLOAT(10,4), defaultValue: 0.0000 },
        // ewallet: { type: Sequelize.INTEGER, defaultValue: 0 },
        // history: { type: Sequelize.STRING },
    });
module.exports = User