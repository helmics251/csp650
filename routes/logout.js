const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error logging out:', err);
            return res.status(500).send('Error logging out');
        }

        console.log('User logged out');
        res.redirect('/');
    });
});


module.exports = router;
