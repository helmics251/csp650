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
    var StaffEmail = req.body.StaffEmail;
    var StaffID = req.body.StaffID;
    var username = req.body.username;
    // Generate random username and password
    var generatedPassword = Math.floor(
      100000000000 + Math.random() * 900000000000
    ).toString();

    // Hash the password
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    // Insert user into the database
    await db
      .collection("staffs")
      .updateOne({ staffId: StaffID }, { $set: { password: hashedPassword } });

    // console log
    console.log(
      "\nPassword Resetted",
      "\nNew Password: " + generatedPassword,
      "\nStaff ID: " + StaffID
    );

    // Send email with new password
    await sendResetPasswordEmail(generatedPassword, StaffEmail, username);

    // Redirect after successful insertion and email sending
    res.redirect("/manageStaff");
  } catch (error) {
    // Handle errors appropriately
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

function sendResetPasswordEmail(password, email, username) {
  const subjectPrefix = "Parcel Management System Password Reset";
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
    text: `Your Password has been changed\n\nPlease Change Your Password After Login.\n\nUsername: ${username}\nNew Password: ${password}\n`,
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
