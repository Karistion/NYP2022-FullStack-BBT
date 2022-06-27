/*
* 'require' is similar to import used in Java and Python. It brings in the libraries required to be used
* in this JS file.
* */
const express = require('express');
const { engine } = require('express-handlebars');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');
const Handlebars = require('handlebars');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const path = require('path');
const helpers = require('./helpers/handlebars');
const fs = require('fs');
require('dotenv').config();
/*
* Creates an Express server - Express is a web application framework for creating web applications
* in Node JS.
*/
const app = express();

// Handlebars Middleware
/*
* 1. Handlebars is a front-end web templating engine that helps to create dynamic web pages using variables
* from Node JS.
*
* 2. Node JS will look at Handlebars files under the views directory
*
* 3. 'defaultLayout' specifies the main.handlebars file under views/layouts as the main template
*
* */
app.engine('handlebars', engine({
	helpers: helpers,
	handlebars: allowInsecurePrototypeAccess(Handlebars), 
	defaultLayout: null
}));
app.set('view engine', 'handlebars');

// Express middleware to parse HTTP body in order to read HTTP data
app.use(express.urlencoded({
	extended: false
}));
app.use(express.json());

// Creates static folder for publicly accessible HTML, CSS and Javascript files
app.use(express.static(path.join(__dirname, 'public')));

// Enables session to be stored using browser's Cookie ID
app.use(cookieParser());

// Library to use MySQL to store session objects
const MySQLStore = require('express-mysql-session');
var options = {
	host: process.env.DB_HOST,
	port: process.env.DB_PORT,
	user: process.env.DB_USER,
	password: process.env.DB_PWD,
	database: process.env.DB_NAME,
	clearExpired: true,
	// The maximum age of a valid session; milliseconds:
	expiration: 3600000, // 1 hour = 60x60x1000 milliseconds
	// How frequently expired sessions will be cleared; milliseconds:
	checkExpirationInterval: 1800000 // 30 min
};

// To store session information. By default it is stored as a cookie on browser
app.use(session({
	key: 'vidjot_session',
	secret: 'tojdiv',
	store: new MySQLStore(options),
	resave: false,
	saveUninitialized: false,
}));

// Bring in database connection
const DBConnection = require('./config/DBConnection');
// Connects to MySQL database
DBConnection.setUpDB(false); // To set up database with new tables
(true)

// Messaging libraries
const flash = require('connect-flash'); //first library
app.use(flash());
const flashMessenger = require('flash-messenger'); //second library
app.use(flashMessenger.middleware);

// Passport Config
const passport = require('passport');
const passportConfig = require('./config/passportConfig');
passportConfig.localStrategy(passport);

// Initilize Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Place to define global variables
app.use(function (req, res, next) {
	res.locals.messages = req.flash('message');
	res.locals.errors = req.flash('error');
	res.locals.user = req.user || null;
	next();
});

// mainRoute is declared to point to routes/main.js
const mainRoute = require('./routes/main');
const userRoute = require('./routes/user/user');
const forumsRoute = require('./routes/forums/forums');
const invoiceRoute = require('./routes/invoice/invoice');
const cartRoute = require('./routes/cart/cart');
// const menuRoute = require('./routes/menu/menu');
// const reportRoute = require('./routes/report/report');
// const trackingRoute = require('./routes/tracking/tracking');
// const voucherRoute = require('./routes/voucher/voucher');
const videoRoute = require('./routes/video');
//const registerRoute = require('./routes/register');

// Any URL with the pattern ‘/*’ is directed to routes/main.js
app.use('/', mainRoute);
app.use('/user', userRoute);
app.use('/forums', forumsRoute);
app.use('/invoice', invoiceRoute);
app.use('/cart', cartRoute)
// app.use('/menu', menuRoute);
// app.use('/report', reportRoute);
// app.use('/tracking', trackingRoute);
// app.use('/voucher', voucherRoute);
app.use('/video', videoRoute);
//app.use('/register', registerRoute);

/*
* Creates a port for express server since we don't want our app to clash with well known
* ports such as 80 or 8080.
* */
const port = 5000;

// Starts the server and listen to port
app.listen(port, () => {
	console.log(`Server started on port ${port}`);
});