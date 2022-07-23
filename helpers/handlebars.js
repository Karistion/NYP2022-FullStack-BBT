const moment = require('moment');
const Handlebars = require('handlebars');
const formatDate = function (date) {
    return moment(date).format('MMM Do YYYY, h:mm:ss a');
};
const formatDay = function (date) {
    return moment(date).format("MMM Do YY");
};
const formatTime = function (date, min) {
    return moment(date).add(min, 'minute').format('h:mm a');
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

const sum = function (num1, num2) {
    return num1 + num2;
}

const check = function (status, num) {
    return (status == num) ? true : false;
}

const cssactive = function (id, active) {
    return (id == active) ? 'active' : '';
}

const statuscompleted = function (status, num) {
    return (status >= num) ? 'completed' : '';
} 

const changestatus = function (status, num, id) {
    if (status==num+1){
        return "/invoice/minusstatus/"+id;
    }else if (status==num-1){
        return "/invoice/plusstatus/"+id;
    }
    else{
        return 'javascript:void(0);';
    }
}

const statusdesc = function (status) {
    if (status==1){
        return "Making Order";
    }else if (status==2){
        return "Collected Order";
    }else if (status==3){
        return "Drinks En Route";
    }else if (status==4){
        return "Drinks Delivered";
    }
}

module.exports = { formatDate,formatDay, formatTime, replaceCommas, checkboxCheck, radioCheck, multiply, cssactive, decimal2, statuscompleted, changestatus, statusdesc, check, sum};