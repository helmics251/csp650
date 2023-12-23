const express = require("express");
const router = express.Router();
const flash = require("express-flash");
router.use(flash());

const { User, Staff } = require("../../middleware/schemamodel");
const { db } = require("../../middleware/setupdb");

router.post("/", async function (req, res) {
  const staffid = req.session.staff.staffId;
  var parcelID = req.body.parcelID;
  var currentLocker = req.body.currentLocker;
  var selectedLocker = req.body.locker; // changed variable name for clarity
  var name = req.body.name;
  var phone = req.body.phone.toString();
  var parceltype = req.body.parceltype;

  var updateParcel = {};

  if (name) {
    updateParcel.name = name;
  }
  if (phone) {
    updateParcel.phone = phone;
  }
  if (parceltype) {
    updateParcel.parceltype = parceltype;
  }

  // Find the current locker and get the entire parcel information
  const currentLockerInfo = await Staff.findOne(
    {
      staffId: req.session.staff.staffId,
      "locker.lockerName": currentLocker,
    },
    { "locker.$": 1 }
  );
  const currentParcelInfo = currentLockerInfo.locker[0].parcel;

  // If selectedLocker is provided, move the parcel to the selected locker
  if (selectedLocker) {
    // Move parcel to the selected locker

    /*console.log(`\nupdateParcel:\n${JSON.stringify(updateParcel, null, 2)}`);
    console.log(`\ncurrentLockerInfo:\n${JSON.stringify(currentLockerInfo, null, 2)}`);
    console.log(`\ncurrentParcelInfo:\n${JSON.stringify(currentParcelInfo, null, 2)}`);*/

    //emptying current locker

    await Staff.updateOne(
      {
        staffId: req.session.staff.staffId,
        "locker.lockerName": currentLocker,
      },
      {
        $set: {
          "locker.$.isEmpty": true,
          "locker.$.parcel": null,
        },
      }
    );

    //move locker, update new locker

    await Staff.updateOne(
      {
        staffId: req.session.staff.staffId,
        "locker.lockerName": selectedLocker,
      },
      {
        $set: {
          "locker.$.isEmpty": false,
          "locker.$.parcel": { ...currentParcelInfo, ...updateParcel },
        },
      },
      { upsert: true }
    );
    // Log the merged data
    console.log("\nMerged Data:", { ...currentParcelInfo, ...updateParcel });
  } else {
    // Update parcel in the current locker
    await Staff.updateOne(
      {
        staffId: req.session.staff.staffId,
        "locker.lockerName": currentLocker,
      },
      {
        $set: {
          "locker.$.parcel": { ...currentParcelInfo, ...updateParcel },
        },
      }
    );
    console.log("\nParcel Updated", { ...currentParcelInfo, ...updateParcel });
  }

  res.redirect("/parcelList");
});

module.exports = router;
