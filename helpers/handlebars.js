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

const checkpoints = function (point, price) {
    return (point >= price*0.9) ? true : false;
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

const statuscolor = function (status) {
    if (status==1){
        return "danger";
    }else if (status==4){
        return "success";
    }
    else{
        return 'warning';
    }
}

const statusdesc = function (status) {
    if (status==1){
        return "Making of Drinks";
    }else if (status==2){
        return "Driver collected Order";
    }else if (status==3){
        return "Drinks En Route to Delivery";
    }else if (status==4){
        return "Drinks Delivered to Home";
    }
}

const dictvalue = function (dict) {
    return Object.values(dict);
} 

const dictkey = function (dict) {
    var list=Object.keys(dict);
    for (x=0;x<dict.length;x++){
        console.log(list[x])
        list[x]=JSON.stringify(list[x])
    }
    return list;
} 

const sumdictvalue = function (dict) {
    return Object.values(dict).reduce((a, b) => a + b, 0).toFixed(2);
} 

const sumdictvaluepercent = function (dict) {
    return Object.values(dict).reduce((a, b) => a + b, 0).toFixed(2)*0.9;
} 

const minus = function (num1, num2) {
    return num1-num2;
} 

const convertpoints = function (num1) {
    if (num1<=1){
        return num1*1
    }else if (num1<=2){
        return num1*1.1
    }else if (num1<=3){
        return num1*1.2
    }else if (num1<=5){
        return num1*1.3
    }else if (num1<=10){
        return num1*1.4
    }else{
        return num1*1.5
    }
}

module.exports = { convertpoints, formatDate,formatDay, formatTime, replaceCommas, checkboxCheck, radioCheck, multiply, cssactive, decimal2, statuscompleted, changestatus, statusdesc, check, checkpoints, sum, dictkey, dictvalue, sumdictvalue, statuscolor,sumdictvaluepercent, minus};