const express = require("express");
const router = express.Router();
const flash = require("express-flash");
router.use(flash());

const { User, Staff } = require("../../middleware/schemamodel");
const { db } = require("../../middleware/setupdb");

router.get("/", async (req, res) => {
    if (!req.session.user ) {
        return res.render("guest/error404");
    }

    const studentList = await User.findOne({ userid: req.session.user.userid });
    const messages = req.flash();

    return res.render("student/studentsetting", {
        studentData: studentList,
        messages: messages,
    }); 
});

module.exports = router;