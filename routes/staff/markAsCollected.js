const express = require("express");
const router = express.Router();
const flash = require("express-flash");
router.use(flash());

const { User, Staff } = require("../../middleware/schemamodel");
const { db } = require("../../middleware/setupdb");

router.post("/", async (req, res) => {
  //console.log(req.body);
  const staffid = req.session.staff.staffId;
  const parcelID = req.body.parcelID;
  const lockerName = req.body.lockerName;

  var dateStr = new Date()
    .toLocaleString("en-MY", { timeZone: "Asia/Kuala_Lumpur" })
    .split(",")[0]
    .trim();

  // Split the date string by "/"
  var dateParts = dateStr.split("/");

  // Rearrange the parts to format the date as "yyyy-mm-dd"
  var formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;

  await Staff.updateOne(
    {
      staffId: staffid,
      "locker.lockerName": lockerName,
    },
    {
      $set: {
        "locker.$.parcel.isCollected": true,
        "locker.$.parcel.dateCollected": formattedDate,
      },
    }
  );

  const currentLockerInfo = await Staff.findOne(
    {
      staffId: staffid,
      "locker.lockerName": lockerName,
    },
    { "locker.$": 1 }
  );
  const currentParcelInfo = currentLockerInfo.locker[0].parcel;

  await db
    .collection("staffs")
    .updateOne(
      { staffId: staffid },
      { $push: { collectedParcel: currentParcelInfo } }
    );

  await Staff.updateOne(
    {
      staffId: staffid,
      "locker.lockerName": lockerName,
    },
    {
      $set: {
        "locker.$.isEmpty": true,
        "locker.$.parcel": null,
      },
    }
  );

  // Check if the user with the specified studentNumber exists
  const existingUser = await User.findOne({ "Parcel.parcelID": parcelID });
  if (existingUser) {
    // Update the user document to add the new parcel to the Parcel array
    await User.updateOne(
      { "Parcel.parcelID": parcelID },
      {
        $pull: {
          Parcel: { parcelID: parcelID },
        },
      }
    );
    console.log("\nUser Parcel collected");
  }

  //console.log("\ncollectedParcel", collectedParcel);
  res.json({ success: true });
});

module.exports = router;
