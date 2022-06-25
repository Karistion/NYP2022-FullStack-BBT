const Sequelize = require('sequelize');
const db = require('../config/DBConfig');
const Drink = db.define('drinks',
    {
        postal: { type: Sequelize.INTEGER },
        address: { type: Sequelize.STRING }
    });
module.exports = Drink