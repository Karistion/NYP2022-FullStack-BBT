const Sequelize = require('sequelize');
const db = require('../config/DBConfig');
const Invoice = db.define('invoice',
    {
        id: { type: Sequelize.UUIDV4 },
        customer_id: { type: Sequelize.STRING },
        postal: { type: Sequelize.INTEGER },
        address: { type: Sequelize.STRING },
        drinks: { type: Sequelize.ARRAY }
    });
module.exports = Invoice