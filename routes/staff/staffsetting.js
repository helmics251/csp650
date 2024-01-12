const express = require("express");
const router = express.Router();
const flash = require("express-flash");
router.use(flash());

const { User, Staff } = require("../../middleware/schemamodel");
const { db } = require("../../middleware/setupdb");

router.get("/", express.urlencoded({ extended: true }), async (req, res) => {
  if (!req.session.staff || req.session.staff.isAdmin) {
    return res.render("guest/error404");
  }

  const staffList = await Staff.findOne({ staffId: req.session.staff.staffId });
  const messages = req.flash();

  return res.render("staff/staffsetting", {
    staffData: staffList,
    messages: messages,
  });
});

module.exports = router;
