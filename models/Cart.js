const Sequelize = require('sequelize');
const db = require('../config/DBConfig');
const Cart = db.define('Cart', {
    id:{ type:Sequelize.DATE, primaryKey: true, defaultValue: Sequelize.NOW },
});
module.exports = Cart