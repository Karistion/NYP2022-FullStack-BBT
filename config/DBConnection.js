const mySQLDB = require('./DBConfig');
const User = require('../models/User');
const Invoice = require('../models/Invoice');
const Drink = require('../models/Drink');
const Cart = require('../models/Cart');
const Cartitems = require('../models/CartItems');
const Threads = require('../models/CustSupp');
const List = require('../models/List');
const Comments = require('../models/Comments');
const Vouchers = require('../models/Vouchers');
// If drop is true, all existing tables are dropped and recreated
const setUpDB = (drop) => {
    mySQLDB.authenticate()
        .then(() => {
            console.log('Database connected');
            /*
            Defines the relationship where a user has many videos.
            The primary key from user will be a foreign key in video.
            */
            User.hasMany(Threads);
            Threads.belongsTo(User);
            Threads.hasMany(Comments);
            Comments.belongsTo(Threads);
            User.hasMany(Comments)
            Comments.belongsTo(User)
            // User.hasMany(Vouchers);
            // Vouchers.belongsTo(User);
            User.hasMany(Invoice);
            Invoice.belongsTo(User);
            Drink.hasMany(Cartitems);
            Cartitems.belongsTo(Drink);
            Cart.hasMany(Cartitems);
            Cartitems.belongsTo(Cart);
            Cart.hasOne(Invoice); 
            User.hasMany(Cart);
            // User.hasOne(List);
            mySQLDB.sync({
                force: drop
            });
        })
        .catch(err => console.log(err));
};
module.exports = { setUpDB };