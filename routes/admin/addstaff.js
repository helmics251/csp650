const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const flash = require("express-flash");
require("dotenv").config();
router.use(flash());

const { User, Staff } = require("../../middleware/schemamodel");
const { db } = require("../../middleware/setupdb");

router.post("/", async function (req, res) {
  try {
    if (req.session.staff && req.session.staff.isAdmin) {
      // Get multipart user input
      const adminaddstaffusername = req.body.adminaddstaffusername;
      const staffEmail = req.body.adminaddstaffemail;

      // Check if adminaddstaffusername already exists in the database
      const existingStaff = await db
        .collection("staffs")
        .findOne({ username: adminaddstaffusername });

      if (existingStaff) {
        req.flash("alert", "Staff with this username already exists");
        return res.redirect("/manageStaff");
      }

      // Generate a random 6-digit staffID
      const generatedStaffID = Math.floor(
        100000 + Math.random() * 900000
      ).toString();
      // Generate random password
      const generatedPassword =
        Math.floor(Math.random() * 1000) +
        "parcel" +
        Math.floor(Math.random() * 1000);

      // Hash the password
      const hashedPassword = await bcrypt.hash(generatedPassword, 10);

      // Insert staff
      const newStaff = {
        username: adminaddstaffusername,
        staffId: generatedStaffID,
        email: staffEmail,
        isAdmin: false,
        password: hashedPassword,
        locker: [],
      };

      // Define the number of rows and columns for the lockers
      const numRows = 5;
      const numColumns = 5;

      // Loop through each row and column to generate locker names
      for (let row = 1; row <= numRows; row++) {
        for (let col = 1; col <= numColumns; col++) {
          // Generate the locker name based on row and column
          const lockerName = String.fromCharCode(65 + row - 1) + col; // A, B, C, ...

          // Create the locker object with name and isEmpty property
          const locker = {
            lockerName: lockerName,
            isEmpty: true,
          };

          // Push the locker name into the locker array
          newStaff.locker.push(locker);
        }
      }

      // Insert user into the database
      console.log("\nStaff Added ", generatedPassword, newStaff);
      await db.collection("staffs").insertOne(newStaff);

      // Send email with username and password
      await sendEmail(adminaddstaffusername, generatedPassword, staffEmail);

      // Redirect after successful insertion and email sending
      return res.redirect("/manageStaff");
    }
    console.log("not admin");
    return res.redirect("/");
  } catch (error) {
    // Handle errors appropriately
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

function sendEmail(username, password, email) {
  const subjectPrefix = "Parcel Management System - Account Credentials";
  const dynamicSubject = `${subjectPrefix} - ${new Date().toLocaleString()}`;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.DOMAIN_EMAIL,
    to: email, // Recipient's email address
    subject: dynamicSubject,
    text: `Dear User,\n\nThank you for joining our Parcel Management System. Here are your account credentials:\n\nUsername: ${username}\nPassword: ${password}\n\nPlease login to your account and change your password for security reasons.\n\nBest regards,\nThe Parcel Management System Team`,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.error(error);
    } else {
      console.log("\nEmail sent: " + info.response);
    }
  });
}

module.exports = router;
