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
  return res.render("guest/signup");
});

router.post("/", async function (req, res) {
  //get multipart user input
  const user = req.body.username;
  const email = req.body.email;
  const phoneNumber = req.body.phoneNumber.toString();
  const studentNumber = req.body.studentNumber.toString();
  const pass = req.body.password;
  const pass2 = req.body.password2;

  //check if passwords match
  if (pass != pass2) {
    req.flash("alert", "Passwords do not match");
    res.redirect("/signup");
    req.flash();
  } else {
    //hash the password
    const hashedPassword = await bcrypt.hash(pass, 10);

    //insert user
    const newUser = {
      username: user,
      email: email,
      phoneNumber: phoneNumber,
      studentNumber: studentNumber,
      password: hashedPassword,
    };

    console.log("\nUser Created");
    await db.collection("users").insertOne(newUser);
    res.redirect("/login");
  }
});

module.exports = router;
