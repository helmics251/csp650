const express = require("express");
const router = express.Router();
const flash = require("express-flash");
router.use(flash());

const { User, Staff } = require("../../middleware/schemamodel");
const { db } = require("../../middleware/setupdb");

router.post("/", async function (req, res) {
  //get multipart user input
  const StaffId = req.body.StaffId;
  const editEmail = req.body.editEmail;

  await db
    .collection("staffs")
    .updateOne({ staffId: StaffId }, { $set: { email: editEmail } });
  console.log("\nEmail Updated\nNew Email: " + editEmail);
  res.redirect("/manageStaff");
});

module.exports = router;
