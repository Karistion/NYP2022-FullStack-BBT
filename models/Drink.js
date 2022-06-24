const Sequelize = require('sequelize');
const db = require('../config/DBConfig');
const Drink = db.define('drinks',
    {
        id: { type: Sequelize.UUID, primaryKey: true },
        customer_id: { type: Sequelize.STRING },
        postal: { type: Sequelize.INTEGER },
        address: { type: Sequelize.STRING }
    });
module.exports = Drink