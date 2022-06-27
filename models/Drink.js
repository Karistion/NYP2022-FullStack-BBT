const Sequelize = require('sequelize');
const db = require('../config/DBConfig');
const Drink = db.define('drinks',
    {
        name: { type: Sequelize.STRING },
        price: { type: Sequelize.DECIMAL(10,2) },
        category: { type: Sequelize.STRING },
        desc: { type: Sequelize.STRING }
    });
module.exports = Drink