const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const flash = require("express-flash");
router.use(flash());

const { User, Staff } = require("../../middleware/schemamodel");
const { db } = require("../../middleware/setupdb");

router.post(
  "/",
  express.urlencoded({ extended: true }),
  async function (req, res) {
    const staffid = req.session.staff.staffId;

    const currentpassword = req.body.currentpassword;
    const newpassword = req.body.newpassword;
    const confirmnewpassword = req.body.confirmnewpassword;

    const staff = await Staff.findOne({ staffId: staffid });

    if (staff) {
      // Compare the provided current password with the stored password in the database
      const passwordMatch = await bcrypt.compare(
        currentpassword,
        staff.password
      );

      if (passwordMatch) {
        // Passwords match, compare new password with confirm new password
        if (newpassword === confirmnewpassword) {
          // Password match, hash new password
          const hashedPassword = await bcrypt.hash(newpassword, 10);

          //update password in database
          await db
            .collection("staffs")
            .updateOne(
              { staffId: staffid },
              { $set: { password: hashedPassword } }
            );
          console.log("\nStaff Password Updated\nNew Password: " + newpassword);
          res.redirect("/staffsetting");
        } else {
          console.log("\nNew Password and Confirm New Password not matched");
          req.flash(
            "alert",
            "New Password and Confirm New Password not matched"
          );
          res.redirect("/staffsetting");
          req.flash();
        }
      } else {
        console.log("\nCurrent Password Incorrect");
        req.flash("alert", "Current Password Incorrect");
        res.redirect("/staffsetting");
        req.flash();
      }
    } else {
      console.log("\nUser not found");
      req.flash("alert", "User not found");
      res.redirect("/staffsetting");
      req.flash();
    }
  }
);

module.exports = router;
