const flashMessage = require("./messenger");

const ensureAdmin = (req, res, next) => {
    if (req.user.member=='admin') {
        return next();
    }
    flashMessage(res, 'error', 'Unauthenticated Access')
    res.redirect('/');
};
module.exports = ensureAdmin;