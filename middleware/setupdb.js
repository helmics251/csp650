const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const mongoUrl = "mongodb://0.0.0.0:27017/parcels";
require('dotenv').config();

// Connect to MongoDB using Mongoose
mongoose.connect(mongoUrl);

let db = mongoose.connection;

// check connection to db
db.on("error", () => console.log("\nerror in connecting database"));
db.once("open", () => {
  console.log("\nConnected to Database");

  // Call the function to set up the admin user
//   setupAdminUser();
});

const { User, Staff } = require("./schemamodel");

// Function to set up the admin
const setupAdminUser = async () => {

    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const existingAdmin = await Staff.findOne({ username: adminUsername });

  if (!existingAdmin) {
    const adminUser = new Staff({
      username: adminUsername,
      isAdmin: true,
      password: hashedPassword,
    });

    await adminUser.save();
    console.log("\nAdmin user created successfully");
  } else {
    console.log("\nAdmin user already exists");
  }
};

module.exports = {
  db,
};
