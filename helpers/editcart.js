const Cart = require('../models/Cart');

const AddtoCart = function (drinkid) {
    Cart.update(
        {
            title, story, classification, language, subtitles,
            dateRelease
        },
        { where: { id: req.user.id }, order: [['updatedAt', 'DESC']],
    }
    )
        .then((result) => {
            console.log(result[0] + ' video updated');
            res.redirect('/video/listVideos');
        })
        .catch(err => console.log(err));
    }