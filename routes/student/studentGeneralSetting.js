const express = require("express");
const router = express.Router();
const flash = require("express-flash");
router.use(flash());

const { User, Staff } = require("../../middleware/schemamodel");
const { db } = require("../../middleware/setupdb");

router.post("/", async (req, res) => {
  try {
    const userid = req.session.user.userid;
    const username = req.body.username;
    const email = req.body.email;

    const existingUser = await User.findOne({ username: username });
    if (existingUser) {
      req.flash("alert", "Username already exists");
      return res.redirect("/studentsetting");
    }

    let updateUser = {};
    if (username !== "") {
      updateUser.username = username;
      req.session.user.username = username;
    }
    if (email !== "") {
      updateUser.email = email;
    }
    if (Object.keys(updateUser).length > 0) {
      await db
        .collection("users")
        .updateOne({ userid: userid }, { $set: updateUser });

      console.log("User Updated:", JSON.stringify(updateUser));
    } else {
      console.log("No fields to update");
    }
    return res.redirect("/studentsetting");
  } catch (error) {
    console.error(error); // Log the error
    res.status(500).json({ error: "Internal Server Error" }); // Send error response to the client
  }
});

module.exports = router;