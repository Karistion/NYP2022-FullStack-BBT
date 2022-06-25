const mySQLDB = require('./DBConfig');
const User = require('../models/User');
const Video = require('../models/Video');
const Cart = require('../models/Cart');
const Invoice = require('../models/Invoice');
// const Invoice = require('../models/Invoice');
// const Invoice = require('../models/Drink');
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
            Invoice.hasOne(Cart); 
            mySQLDB.sync({
                force: drop
            });
        })
        .catch(err => console.log(err));
};
module.exports = { setUpDB };