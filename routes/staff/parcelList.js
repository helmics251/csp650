const express = require("express");
const router = express.Router();
const flash = require("express-flash");
router.use(flash());

const { User, Staff } = require("../../middleware/schemamodel");
const { db } = require("../../middleware/setupdb");

router.get("/", async (req, res) => {
  if (req.session.staff) {
    const staffList = await Staff.findOne(
      { staffId: req.session.staff.staffId },
      { locker: 1, _id: 0 }
    );
    const pricing = await Staff.findOne({ staffId: req.session.staff.staffId });

    //console.log("\nLocker List\n", staffList);
    //console.log(staffList.locker.length);

    res.render("staff/parcelList", { staffData: staffList, pricing: pricing });
  }
});

module.exports = router;
