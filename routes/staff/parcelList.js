const express = require("express");
const router = express.Router();
const flash = require("express-flash");
router.use(flash());

const { User, Staff } = require("../../middleware/schemamodel");
const { db } = require("../../middleware/setupdb");

router.get("/", async (req, res) => {
  if (req.session.staff) {
    if (req.session.staff.isAdmin) {
      return res.render("guest/error404");
    }
    const staffList = await Staff.findOne(
      { staffId: req.session.staff.staffId },
      { locker: 1, _id: 0 }
    );
    const pricing = await Staff.findOne({staffId: req.session.staff.staffId});

    if ( pricing.pricing && pricing.pricing.length > 0 ) {
      return res.render("staff/parcelList", { staffData: staffList});
    }
    return res.redirect("/staffsetting");
  }
  return res.render("guest/error404");
});

module.exports = router;
