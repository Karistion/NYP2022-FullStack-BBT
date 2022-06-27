const Sequelize = require('sequelize');
const db = require('../config/DBConfig');
const Cart = db.define('Cart', {
    id:{ type:Sequelize.DATE, primaryKey: true, defaultValue: Sequelize.NOW },
    totalPrice: { type:Sequelize.DECIMAL(10,2), defaultValue: 0  },
});
module.exports = Cart