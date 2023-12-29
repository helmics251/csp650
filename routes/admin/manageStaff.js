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
    if (req.session.staff && req.session.staff.isAdmin) {
      const staffList = await Staff.find({ isAdmin: false });

      return res.render("admin/manageStaff", { staffData: staffList });

    }
    return res.render("guest/error404");
  }
);

module.exports = router;
