const Sequelize = require('sequelize');
const db = require('../config/DBConfig');
const Cart = db.define('Cart', {});
module.exports = Cart