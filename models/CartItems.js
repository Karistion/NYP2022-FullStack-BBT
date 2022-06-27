const Sequelize = require('sequelize');
const db = require('../config/DBConfig');
const Cartitems = db.define('Cartitems', {
    sugar: { type:Sequelize.INTEGER},
    topping: { type:Sequelize.STRING},
    quantity: { type:Sequelize.INTEGER},
});
module.exports = Cartitems