const moment = require('moment');
const Handlebars = require('handlebars');
const formatDate = function (date, targetFormat) {
    return moment(date).format(targetFormat);
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
    return drink*quantity
}

const cssactive = function (id, active) {
    return (id == active) ? 'active' : '';
}

module.exports = { formatDate, replaceCommas, checkboxCheck, radioCheck, multiply, cssactive };