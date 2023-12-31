const express = require("express");
const router = express.Router();
const flash = require("express-flash");
router.use(flash());

const { User, Staff } = require("../../middleware/schemamodel");
const { db } = require("../../middleware/setupdb");

router.post("/", async function (req, res) {
  //console.log("req.body " + req.body);
  // get multipart user input
  const staffid = req.session.staff.staffId;
  var username = req.body.username;
  var email = req.body.email;

  // create an object with only non-empty fields
  var updateStaff = {};
  if (username !== "") {
    updateStaff.username = username;
    req.session.staff.username = username;
    //console.log(req.session.staff.username);
  }
  if (email !== "") {
    updateStaff.email = email;
  }

  // Check if updateUser has any properties before updating
  if (Object.keys(updateStaff).length > 0) {
    await db
      .collection("staffs")
      .updateOne({ staffId: staffid }, { $set: updateStaff });

    console.log("\nStaff Updated\n" + JSON.stringify(updateStaff));
  } else {
    console.log("\nNo fields to update\n");
  }

  res.redirect("/staffsetting");
});

module.exports = router;
