const express = require("express");
const router = express.Router();
const flash = require("express-flash");
router.use(flash());

const { User, Staff } = require("../../middleware/schemamodel");
const { db } = require("../../middleware/setupdb");

router.post(
  "/",
  express.urlencoded({ extended: true }),
  async function (req, res) {
    const staffId = req.session.staff.staffId;
    const staff = await db.collection("staffs").findOne({ staffId: staffId });
    const numColumns = 5;

    const numNewLockers = parseInt(req.body.newlockeramount);

    // Generate and add new lockers to the staff's locker array
    const updatedLockers = [];
    for (let i = 0; i < numNewLockers; i++) {
      const lastLocker = staff.locker[staff.locker.length - 1];
      const currentRow = lastLocker
        ? lastLocker.lockerName.charCodeAt(0) - 65 + 1
        : 1;
      const currentCol = lastLocker
        ? parseInt(lastLocker.lockerName.substring(1))
        : 0;

      let newRow = currentRow;
      let newCol = currentCol + 1;

      if (newCol > numColumns) {
        newRow++;
        newCol = 1;
      }

      const lockerName = String.fromCharCode(65 + newRow - 1) + newCol;

      const newLocker = {
        lockerName: lockerName,
        isEmpty: true,
      };

      updatedLockers.push(newLocker);
    }

    await db
      .collection("staffs")
      .updateOne(
        { staffId: staffId },
        { $push: { locker: { $each: updatedLockers } } }
      );

    console.log("\nLocker Added ", updatedLockers);

    res.redirect("/staffsetting");
  }
);

module.exports = router;
