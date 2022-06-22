const Sequelize = require('sequelize');
const db = require('../config/DBConfig');
const Invoice = db.define('invoice',
    {
        id: { type: Sequelize.UUID, allowNull: false, unique: true, primaryKey: true},
        card_number: { type: Sequelize.INTEGER, allowNull: false },
        card_name: { type: Sequelize.INTEGER, allowNull: false },
        postal: { type: Sequelize.STRING, allowNull: false },
        address: { type: Sequelize.STRING, allowNull: false },
        datedelivery: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
        status: { type: Sequelize.INTEGER(1), allowNull: false, defaultValue:1 },
        delivered: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue:false },
    });
module.exports = Invoice