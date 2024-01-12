const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const flash = require("express-flash");
router.use(flash());

const { User, Staff } = require("../middleware/schemamodel");
const { db } = require("../middleware/setupdb");

router.get("/", async (req, res) => {
  const { staff, user } = req.session;
  if (staff && staff.isAdmin) {
    return res.redirect("/manageStaff");
  }

  if (staff) {
    const staffid = staff.staffId;
    const staffList = await Staff.findOne({ staffId: staffid });
    if (staffList.pricing && staffList.pricing.length > 0) {
      return res.render("staff/indexstaff", { staffData: staffList });
    }
    return res.redirect("/staffsetting");
  }

  if (user) {
    const username = user.username;
    const userList = await User.findOne({ username: username });
    const messages = req.flash();
    return res.render("student/indexstudent", {
      userData: userList,
      messages: messages,
    });
  }

  return res.render("guest/indexguest");
});

module.exports = router;
