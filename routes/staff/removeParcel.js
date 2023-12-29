const express = require("express");
const router = express.Router();
const flash = require("express-flash");
router.use(flash());

const { User, Staff } = require("../../middleware/schemamodel");
const { db } = require("../../middleware/setupdb");

router.post("/", async (req, res) => {
  try {
    const staffid = req.session.staff.staffId;
    const parcelID = req.body.parcelID;
    const lockerName = req.body.lockerName;

    // Find the staff and locker information
    const staff = await Staff.findOne({
      staffId: staffid,
      "locker.lockerName": lockerName,
    });

    // Retrieve the current parcel information
    const currentParcelInfo = staff.locker.find(
      (locker) => locker.lockerName === lockerName
    ).parcel;

    // Move the current parcel to the "removedParcel" array
    /*
        await Staff.updateOne(
            { staffId: staffid },
            {
                $push: {
                    removedParcel: {
                        $each: [currentParcelInfo],
                        $position: 0, // Add the current parcel at the beginning
                    },
                },
            }
        );
        */

    await db
      .collection("staffs")
      .updateOne(
        { staffId: staffid },
        { $push: { removedParcel: currentParcelInfo } }
      );

    // Empty the current locker
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

    const existingUser = await User.findOne({ "Parcel.parcelID": parcelID });
    if (existingUser) {
      await User.updateOne(
        { "Parcel.parcelID": parcelID },
        {
          $pull: {
            Parcel: { parcelID: parcelID },
          },
        }
      );
      console.log("\nUser Parcel removed");
    }
    console.log("parcel removed");
    res.json({ success: true });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

module.exports = router;
