const Sequelize = require('sequelize');
const db = require('../config/DBConfig');
const Invoice = db.define('invoice',
    {
        card_number: { type: Sequelize.BIGINT, allowNull: false },
        card_name: { type: Sequelize.STRING, allowNull: false },
        postal: { type: Sequelize.STRING, allowNull: false },
        address: { type: Sequelize.STRING, allowNull: false },
        totalprice: { type:Sequelize.FLOAT(10,2), allowNull: false },
        datedelivery: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
        status: { type: Sequelize.INTEGER(1), allowNull: false, defaultValue:1 },
        delivered: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue:false },
    });
module.exports = Invoice