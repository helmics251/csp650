const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const flash = require("express-flash");
router.use(flash());

const { User, Staff } = require("../../middleware/schemamodel");
const { db } = require("../../middleware/setupdb");

router.get("/", function (req, res) {
  if (req.session.staff || req.session.user){
    return res.redirect("/");
  }
  return res.render("guest/login");
});

router.post(
  "/studentLogin",
  express.urlencoded({ extended: true }),
  async function (req, res) {
    var username = req.body.username;
    var password = req.body.password;

    const user = await User.findOne({ username });

    if (user) {
      // Compare the provided password with the stored password in the database
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (passwordMatch) {
        // Passwords match, authentication successful

        // If authentication is successful, save data to the session
        req.session.user = {
          username: username,
          isLoggedIn: true,
        };

        console.log("\nLogin successful!");
        res.redirect("/");
      } else {
        console.log("\nIncorrect password");
        req.flash("alert", "Incorrect password");
        res.render("login");
        req.flash();
      }
    } else {
      console.log("\nUser not found");
      req.flash("alert", "User not found");
      res.render("login");
      req.flash();
    }
  }
);

router.post(
  "/staffLogin",
  express.urlencoded({ extended: true }),
  async function (req, res) {
    var username = req.body.username;
    var password = req.body.password;

    const staff = await Staff.findOne({ username });

    if (staff) {
      // Compare the provided password with the stored password in the database
      const passwordMatch = await bcrypt.compare(password, staff.password);

      if (passwordMatch) {
        // Passwords match, authentication successful

        // If authentication is successful, save data to the session
        req.session.staff = {
          username: username,
          staffId: staff.staffId,
          isStaff: !staff.isAdmin, // Set isStaff to true for staff, false for admin
          isAdmin: staff.isAdmin,
          isLoggedIn: true,
        };

        console.log("\nLogin successful!");
        // Redirect based on user role
        if (staff.isAdmin) {
          res.redirect("/manageStaff");
        } else {
          res.redirect("/");
        }
      } else {
        console.log("\nIncorrect password");
        req.flash("alert", "Incorrect password");
        res.render("login");
        req.flash();
      }
    } else {
      console.log("\nUser not found");
      req.flash("alert", "User not found");
      res.render("login");
      req.flash();
    }
  }
);

module.exports = router;
