const flashMessage = require("./messenger");

const idcheck = (req, res, next, id) => {
    if (req.user.member=='admin') {
        return next();
    }
    flashMessage(res, 'error', 'Unauthenticated Access')
    res.redirect('/');
};
module.exports = ensureAdmin;