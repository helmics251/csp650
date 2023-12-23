const express = require("express");
const router = express.Router();
const flash = require("express-flash");
router.use(flash());

const { User, Staff } = require("../../middleware/schemamodel");
const { db } = require("../../middleware/setupdb");

router.post("/", async function (req, res) {
  try {
    // Get user input
    var STAFFID = req.body.STAFFID;

    // Find the staff data in the "Staff" collection
    const staffData = await Staff.findOne({ staffId: STAFFID });

    // Move the staff data to "deletedStaffRecords" collection
    const deletedStaffData = { ...staffData.toObject(), _id: null }; // Remove or reset _id
    await db.collection("deletedStaffRecords").insertOne(deletedStaffData);

    // Delete record from the "Staff" collection
    await Staff.deleteOne({ staffId: STAFFID });
    console.log(
      "\nStaff \nStaff ID: " +
        STAFFID +
        "\nUsername: " +
        staffData.username +
        " have been removed"
    );

    // Redirect after successful delete record
    res.redirect("/manageStaff");
  } catch (error) {
    // Handle errors appropriately
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
