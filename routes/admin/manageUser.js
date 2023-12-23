const express = require("express");
const router = express.Router();
const flash = require("express-flash");
router.use(flash());

const { User, Staff } = require("../../middleware/schemamodel");
const { db } = require("../../middleware/setupdb");

router.get(
  "/",
  express.urlencoded({ extended: true }),
  async function (req, res) {
    const userList = await User.find();

    res.render("admin/manageUser", { userData: userList });
  }
);

module.exports = router;
