const express = require("express");
const router = express.Router();
const flash = require("express-flash");
const moment = require("moment");
const validator = require('validator');
router.use(flash());

const { User, Staff } = require("../../middleware/schemamodel");
const { db } = require("../../middleware/setupdb");

router.post("/", express.urlencoded({ extended: true }), async (req, res) => {
  try {
    //console.log(req.body.guestSearch);
    const guestSearch = req.body.guestSearch.toString();
     // Validate the guestSearch input
    if (!validator.isAlphanumeric(guestSearch)) {
      return res.status(400).json({
        error: "Invalid input provided"
      });
    }
    let filter;
    let guestparcel = await db.collection("staffs").findOne({
      "locker.isEmpty": false,
      "locker.parcel.tracking": guestSearch,
    });
    
    if (guestparcel === null) {
      guestparcel = [];
      console.log(guestparcel);
      return res.status(404).json({
        error: `No Parcel Found with the tracking number "${guestSearch}"`,
      });
    } else {
      filter = guestparcel.locker
      .filter((locker) => locker.parcel?.tracking === guestSearch)
      .map((locker) => {
          const formattedDateAdded = moment(locker.parcel.dateAdded).format('DD MMM YYYY');
          return {
              ...locker.parcel,
              dateAdded: formattedDateAdded
          };
      });
      console.log(filter);
      return res.status(200).json({
        filter,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
  //console.log(filter);
});

module.exports = router;
