const express = require("express");
const router = express.Router();
const flash = require("express-flash");
router.use(flash());

const { User, Staff } = require("../../middleware/schemamodel");
const { db } = require("../../middleware/setupdb");

router.post("/", async function (req, res) {
  try {
    // Get user input
    const deletestudentNumber = req.body.deletestudentNumber;

    // Find the user data in the "users" collection
    const userData = await User.findOne({ studentNumber: deletestudentNumber });

    // Move the staff data to "deletedStaffRecords" collection
    const deletedUserData = { ...userData.toObject(), _id: null }; // Remove or reset _id
    await db.collection("deletedUserRecords").insertOne(deletedUserData);

    // Delete record from the "users" collection
    await User.deleteOne({ studentNumber: deletestudentNumber });
    console.log(
      "\nUser \nStudent Number: " +
        deletestudentNumber +
        "\nUsername: " +
        userData.username +
        " have been removed"
    );

    // Redirect after successful delete record
    res.redirect("/manageUser");
  } catch (error) {
    // Handle errors appropriately
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
