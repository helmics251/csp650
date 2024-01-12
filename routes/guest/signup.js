const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");

const flash = require("express-flash");
router.use(flash());

const { User, Staff } = require("../../middleware/schemamodel");
const { db } = require("../../middleware/setupdb");
const { v4: uuidv4 } = require("uuid");

router.get("/", function (req, res) {
  if (req.session.staff || req.session.user) {
    return res.redirect("/");
  }
  const messages = req.flash();
  return res.render("guest/signup", { messages: messages });
});

router.post("/", async function (req, res) {
  const { username, email, phoneNumber, studentNumber, password, password2 } =
    req.body;

  const cleanedPhoneNumber = phoneNumber.replace(/[-\s]/g, "");

  // Check if username is invalid
  const isAdminUsername = /admin/i.test(username);
  if (isAdminUsername) {
    req.flash("alert", "Invalid Username.");
    return res.redirect("/signup");
  }

  // Check if user already exists
  const checkExistingUser = await db.collection("users").findOne({
    $or: [
      {
        studentNumber: studentNumber,
      },
      {
        username: username,
      },
    ],
  });

  if (checkExistingUser) {
    if (checkExistingUser.studentNumber === studentNumber) {
      req.flash("alert", "User with this student number already exists");
    } else if (checkExistingUser.username === username) {
      req.flash("alert", "User with this username already exists");
    }
    return res.redirect("/signup");
  }

  // Check if passwords match
  if (password !== password2) {
    req.flash("alert", "Passwords do not match");
    return res.redirect("/signup");
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Insert user
  const newUser = {
    userid: uuidv4(),
    username: username,
    email: email,
    phoneNumber: cleanedPhoneNumber,
    studentNumber: studentNumber,
    password: hashedPassword,
  };

  console.log("\nUser Created");
  await db.collection("users").insertOne(newUser);
  res.redirect("/login");
});

module.exports = router;
