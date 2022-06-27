const Sequelize = require('sequelize');
const db = require('../config/DBConfig');
const Invoice = db.define('invoice',
    {
        card_number: { type: Sequelize.BIGINT },
        card_name: { type: Sequelize.STRING },
        postal: { type: Sequelize.STRING },
        address: { type: Sequelize.STRING },
        totalPrice: { type:Sequelize.DECIMAL(10,2) },
        datedelivery: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
        status: { type: Sequelize.INTEGER(1), allowNull: false, defaultValue:1 },
        delivered: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue:false },
    });
module.exports = Invoice