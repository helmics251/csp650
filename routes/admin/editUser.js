const express = require("express");
const router = express.Router();
const flash = require("express-flash");
router.use(flash());

const { User, Staff } = require("../../middleware/schemamodel");
const { db } = require("../../middleware/setupdb");

router.post("/", async function (req, res) {
  // get multipart user input
  const studentNumber = req.body.studentNumber;
  // const editusername = req.body.editusername;
  const editemail = req.body.editemail;
  // console.log(editemail);
  // const phoneNumber = req.body.phoneNumber;

  // create an object with only non-empty fields
  let updateUser = {};
  // if (editusername !== "") {
  //   updateUser.username = editusername;
  // }
  if (editemail !== "") {
    updateUser.email = editemail;
  }
  // if (phoneNumber !== "") {
  //   updateUser.phoneNumber = phoneNumber;
  // }

  // Check if updateUser has any properties before updating
  if (Object.keys(updateUser).length > 0) {
    const result = await db
      .collection("users")
      .updateOne({ studentNumber: studentNumber }, { $set: updateUser });

    // console.log("\nUser Updated\n" + JSON.stringify(updateUser));
    console.log(result);
  } else {
    console.log("\nNo fields to update\n");
  }

  res.redirect("/manageUser");
});

module.exports = router;
