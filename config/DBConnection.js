const mySQLDB = require('./DBConfig');
const User = require('../models/User');
const Video = require('../models/Video');
const Invoice = require('../models/Invoice');
const Drink = require('../models/Drink');
const Cart = require('../models/Cart');
const Cartitems = require('../models/CartItems');
// If drop is true, all existing tables are dropped and recreated
const setUpDB = (drop) => {
    mySQLDB.authenticate()
        .then(() => {
            console.log('Database connected');
            /*
            Defines the relationship where a user has many videos.
            The primary key from user will be a foreign key in video.
            */
            User.hasOne(Video);
            Video.belongsTo(User);
            User.hasMany(Invoice);
            Invoice.belongsTo(User);
            Drink.hasMany(Cartitems);
            Cart.hasMany(Cartitems);
            Cartitems.belongsTo(Cart);
            Cart.hasOne(Invoice); 
            User.hasMany(Cart);
            mySQLDB.sync({
                force: drop
            });
        })
        .catch(err => console.log(err));
};
module.exports = { setUpDB };