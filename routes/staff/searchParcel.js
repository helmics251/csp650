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
    const foundItems = [];

    staff.locker.forEach((locker) => {
      // Check if lockerName matches the search term
      if (new RegExp(searchTerm, "i").test(locker.lockerName)) {
        foundItems.push({
          lockerName: locker.lockerName,
          parcel: locker.parcel,
        });
      } else if (locker.parcel && typeof locker.parcel === "object") {
        // Check if any parcel property matches the search term
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

    // Limit the search result to 3 items
    const limitedItems = foundItems.slice(0, 3);

    if (limitedItems.length === 0) {
      return res.status(404).json({ error: "No items found" });
    }

    res.status(200).json({ foundItems: limitedItems });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
