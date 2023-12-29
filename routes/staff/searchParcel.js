const express = require("express");
const router = express.Router();
const flash = require("express-flash");
router.use(flash());

const { User, Staff } = require("../../middleware/schemamodel");
const { db } = require("../../middleware/setupdb");

router.post("/", async (req, res) => {
  try {
    const staffid = req.session.staff.staffId;
    const searchTerm = req.body.search;

    // Find the staff by staffId
    const staff = await Staff.findOne({ staffId: staffid });

    if (!staff) {
      return res.status(404).json({ error: "Searching Error" });
    }

    // Search for parcels and lockerName containing the searchTerm
    let foundItems = [];

    staff.locker.forEach((locker) => {
      // Exclude terms with less than 4 alphanumeric characters or those containing special symbols
      if (!/^[a-zA-Z0-9]{4,}$/.test(searchTerm) || /[^a-zA-Z0-9]/.test(searchTerm)) {
        return;
      }

      // Check if lockerName contains the search term as a whole word
      if (new RegExp(searchTerm, "i").test(locker.lockerName)) {
        foundItems.push({
          lockerName: locker.lockerName,
          parcel: locker.parcel,
        });
      } else if (locker.parcel && typeof locker.parcel === "object") {
        // Check if any parcel property contains the search term as a whole word
        const parcelKeys = Object.keys(locker.parcel);
        if (
          parcelKeys.some((key) =>
            new RegExp(searchTerm, "i").test(locker.parcel[key])
          )
        ) {
          foundItems.push({
            lockerName: locker.lockerName,
            parcel: locker.parcel,
          });
        }
      }
    });


    const limitedItems = foundItems.slice(0, 1);

    if (limitedItems.length === 0) {
      return res.status(404).json({ error: "No items found" });
    }

    return res.status(200).json({ foundItems: limitedItems });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
