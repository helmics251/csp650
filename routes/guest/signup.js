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
  const messages = req.flash();
  return res.render("guest/signup", {messages: messages});
});

router.post("/", async function (req, res) {
  //get multipart user input
  const user = req.body.username;
  const email = req.body.email;
  const phoneNumber = req.body.phoneNumber.toString();
  const studentNumber = req.body.studentNumber.toString();
  const pass = req.body.password;
  const pass2 = req.body.password2;

  // check username
  const isAdminUsername = /admin/i.test(user);
  if (isAdminUsername) {
    req.flash("alert", "Invalid Username.");
    return res.redirect("/signup");
  }

  const checkexistinguser = await db.collection("users").findOne({studentNumber: studentNumber});
  // console.log(checkexistinguser);

  if (checkexistinguser) {
    req.flash("alert", "User with this student number already exist");
    return res.redirect("/signup")
  }

  //check if passwords match
  if (pass != pass2) {
    req.flash("alert", "Passwords do not match");
    return res.redirect("/signup");
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
