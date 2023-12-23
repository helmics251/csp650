const express = require("express");
const router = express.Router();
const flash = require("express-flash");
router.use(flash());

const { User, Staff } = require("../../middleware/schemamodel");
const { db } = require("../../middleware/setupdb");

router.post("/", async (req, res) => {
  console.log(req.body);
  const selectedLocker = req.body.locker;

  await Staff.updateOne(
    {
      staffId: req.session.staff.staffId,
    },
    {
      $pull: {
        locker: {
          lockerName: selectedLocker,
        },
      },
    }
  );
  console.log("Locker Removed");
  return res.redirect("/staffsetting");
});

module.exports = router;
