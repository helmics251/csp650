const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const flash = require("express-flash");
router.use(flash());

const { User, Staff } = require("../../middleware/schemamodel");
const { db } = require("../../middleware/setupdb");

router.post("/", async function (req, res) {
  try {
    // Get multipart user input
    var staffEmail = req.body.staffEmail;
    // Generate a random 6-digit staffID
    var generatedStaffID = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    // Generate random username and password
    var generatedUsername = "staff" + Math.floor(Math.random() * 1000);
    var generatedPassword =
      Math.floor(Math.random() * 1000) +
      "parcel" +
      Math.floor(Math.random() * 1000);

    // Hash the password
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    // Insert staff
    var newStaff = {
      username: generatedUsername,
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
    await sendEmail(generatedUsername, generatedPassword, staffEmail);

    // Redirect after successful insertion and email sending
    res.redirect("/manageStaff");
  } catch (error) {
    // Handle errors appropriately
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

function sendEmail(username, password, email) {
  const subjectPrefix = "Your Parcel Management System Credentials";
  const dynamicSubject = `${subjectPrefix} - ${new Date().toLocaleString()}`;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "testparcel20@gmail.com", // Your Gmail email address
      pass: "beeg irpk xkim afiq", // Your Gmail password or App Password
    },
  });

  const mailOptions = {
    from: "testparcel20@gmail.com", // Your Gmail email address
    to: email, // Recipient's email address
    subject: dynamicSubject,
    text: `Please Change Your Password After Login.\n\nUsername: ${username}\nPassword: ${password}\n`,
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
