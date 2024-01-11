const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const flash = require("express-flash");
router.use(flash());

const { User, Staff } = require("../../middleware/schemamodel");
const { db } = require("../../middleware/setupdb");

router.post("/", async (req, res) => {
  try {
    const { userid } = req.session.user;
    const { currentpassword, newpassword, confirmnewpassword } = req.body;

    const user = await User.findOne({ userid });

    if (!user) {
      console.log("\nUser not found");
      req.flash("alert", "User not found");
      return res.redirect("/studentsetting");
    }

    const passwordMatch = await bcrypt.compare(currentpassword, user.password);

    if (!passwordMatch) {
      console.log("\nCurrent Password Incorrect");
      req.flash("alert", "Current Password Incorrect");
      return res.redirect("/studentsetting");
    }

    if (newpassword !== confirmnewpassword) {
      console.log("\nNew Password and Confirm New Password not matched");
      req.flash("alert", "New Password and Confirm New Password not matched");
      return res.redirect("/studentsetting");
    }

    const hashedPassword = await bcrypt.hash(newpassword, 10);
    await db
      .collection("users")
      .updateOne({ userid: userid }, { $set: { password: hashedPassword } });

    console.log("\nUser Password Updated\nNew Password: " + newpassword);
    return res.redirect("/studentsetting");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
