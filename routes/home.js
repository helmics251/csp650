const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const flash = require("express-flash");
router.use(flash());

const { User, Staff } = require("../middleware/schemamodel");
const { db } = require("../middleware/setupdb");

router.get("/", async (req, res) => {
  // Check if there's a user in the session
  if (req.session.staff) {
    if (req.session.staff.isAdmin) {
      return res.redirect("/manageStaff");
    }
    const staffid = req.session.staff.staffId;
    const staffList = await Staff.findOne({ staffId: staffid });
    return res.render("staff/indexstaff", { staffData: staffList });
  } else if (req.session.user) {
    const username = req.session.user.username;
    const userList = await User.findOne({ username: username });
    return res.render("student/indexstudent", { userData: userList });
  } else {
    // If the session is empty, render the page without staffData
    return res.render("guest/indexguest");
  }
});

module.exports = router;
