const Sequelize = require('sequelize');
const db = require('../config/DBConfig');
const Cartitems = db.define('cartitems', {
    sugar: { type:Sequelize.INTEGER},
    topping: { type:Sequelize.STRING},
    ice: { type:Sequelize.STRING},
    price: { type:Sequelize.DECIMAL(10,2)},
    quantity: { type:Sequelize.INTEGER},
});
module.exports = Cartitems