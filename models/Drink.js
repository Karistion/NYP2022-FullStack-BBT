const Sequelize = require('sequelize');
const db = require('../config/DBConfig');
const Drink = db.define('drinks',
    {
        id: { type: Sequelize.UUIDV4 },
        customer_id: { type: Sequelize.STRING },
        postal: { type: Sequelize.INTEGER },
        address: { type: Sequelize.STRING }
    });
module.exports = Drink