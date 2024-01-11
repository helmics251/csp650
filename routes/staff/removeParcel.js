const express = require("express");
const router = express.Router();
const flash = require("express-flash");
router.use(flash());

const { User, Staff } = require("../../middleware/schemamodel");
const { db } = require("../../middleware/setupdb");

// Function to retrieve staff information
const findStaff = async (staffid, lockerName) => {
  return await Staff.findOne({
    staffId: staffid,
    "locker.lockerName": lockerName,
  });
};

// Function to retrieve current parcel information
const getCurrentParcelInfo = (staff, lockerName) => {
  return staff.locker.find((locker) => locker.lockerName === lockerName).parcel;
};

// Function to remove parcel from staff
const removeParcelFromStaff = async (staffid, currentParcelInfo) => {
  await db.collection("staffs").updateOne(
    { staffId: staffid },
    { $push: { removedParcel: currentParcelInfo } }
  );
};

// Function to empty a locker
const emptyLocker = async (staffid, lockerName) => {
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
};

// Function to remove parcel from user
const removeParcelFromUser = async (parcelID) => {
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
};

router.post("/", async (req, res) => {
  try {
    const staffid = req.session.staff.staffId;
    const parcelID = req.body.parcelID;
    const lockerName = req.body.lockerName;

    const staff = await findStaff(staffid, lockerName);
    const currentParcelInfo = getCurrentParcelInfo(staff, lockerName);

    await removeParcelFromStaff(staffid, currentParcelInfo);
    await emptyLocker(staffid, lockerName);
    await removeParcelFromUser(parcelID);

    console.log("parcel removed");
    res.json({ success: true });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});


module.exports = router;
