const express = require("express");
const router = express.Router();
const flash = require("express-flash");
router.use(flash());

const { User, Staff } = require("../../middleware/schemamodel");
const { db } = require("../../middleware/setupdb");

router.get("/", async (req, res) => {
  if (!req.session.staff || req.session.staff.isAdmin ) {
    return res.render("guest/error404");
  }

  const staffId = req.session.staff.staffId;

  const staffList = await Staff.findOne(
    { staffId },
    { locker: 1, _id: 0 }
  );

  const pricing = await Staff.findOne({ staffId });

  if (!pricing.pricing || pricing.pricing.length === 0) {
    return res.redirect("/staffsetting");
  }

  return res.render("staff/parcelList", { staffData: staffList });
});


module.exports = router;
