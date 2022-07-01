const moment = require('moment');
const Handlebars = require('handlebars');
const formatDate = function (date) {
    return moment(date).format("DD-MM-YYYY, hh:mm:ss");
};
const replaceCommas = function (value) {
    return value ? value.replace(/,/g, ' | ') : 'None';
}
const checkboxCheck = function (value, checkboxValue) {
    return (value.search(checkboxValue) >= 0) ? 'checked' : '';
};
const radioCheck = function (value, radioValue) {
    return (value == radioValue) ? 'checked' : '';
};

const multiply = function (drink, quantity) {
    return (drink*quantity).toFixed(2);
}

const decimal2 = function (drink) {
    return drink.toFixed(2);
}

const cssactive = function (id, active) {
    return (id == active) ? 'active' : '';
}


module.exports = { formatDate, replaceCommas, checkboxCheck, radioCheck, multiply, cssactive, decimal2};