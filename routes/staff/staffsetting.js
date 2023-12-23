const express = require("express");
const router = express.Router();
const flash = require("express-flash");
router.use(flash());

const { User, Staff } = require("../../middleware/schemamodel");
const { db } = require("../../middleware/setupdb");

router.get(
  "/",
  express.urlencoded({ extended: true }),
  async function (req, res) {
    if (req.session.staff) {
      if (req.session.staff.isAdmin) {
        return res.redirect("/manageStaff");
      }
      const staffList = await Staff.findOne({
        staffId: req.session.staff.staffId,
      });
      //console.log(staffList);
      const messages = req.flash();

      return res.render("staff/staffsetting", {
        staffData: staffList,
        messages: messages,
      });
    } else {
      return res.redirect("/");
    }
  }
);

module.exports = router;
