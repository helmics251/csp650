const express = require("express");
const router = express.Router();
const flash = require("express-flash");
const moment = require("moment");
router.use(flash());

const { User, Staff } = require("../../middleware/schemamodel");
const { db } = require("../../middleware/setupdb");

router.get("/", async (req, res) => {
  if (req.session.staff) {
    if (req.session.staff.isAdmin) {
      return res.render("guest/error404");
    }
    const staffList = await Staff.findOne({
      staffId: req.session.staff.staffId,
    });

    if (staffList.pricing && staffList.pricing.length > 0) {
      const messages = req.flash();

      return res.render("staff/report", { staffData: staffList, messages: messages });
    }
    return res.redirect("/staffsetting");
  }
  return res.render("guest/error404");
});

router.post("/", async (req, res) => {
  try {
    const reportDate = req.body.reportDate;
    console.log("orginal date: " + reportDate);
    const formattedDate = moment(reportDate).format("DD MMM YYYY");
    const newformattedDate = moment(reportDate).format("DD/MM/YYYY");
    //console.log(formattedDate);

    let staff = await db
      .collection("staffs")
      .findOne({ staffId: req.session.staff.staffId });
    const foundAddedParcel = [];

    if (!staff) {
      return res.status(404).json({ error: "Staff not found" });
    }

    // Filter collected parcels with the specified reportDate
    const foundCollectedParcels = staff.collectedParcel.filter(
      (parcel) => parcel.dateCollected === newformattedDate
    );
    const addedParcelFromLocker = staff.locker
      .filter((locker) => locker.parcel?.dateAdded === newformattedDate)
      .map((locker) => locker.parcel);
    const addedParcelFromCollectedParcel = staff.collectedParcel.filter(
      (parcel) => parcel.dateAdded === newformattedDate
    );

    if (addedParcelFromLocker.length > 0) {
      foundAddedParcel.push(...addedParcelFromLocker);
      //console.log("addedParcelFromLocker: " + JSON.stringify(addedParcelFromLocker) );
    }

    if (addedParcelFromCollectedParcel.length > 0) {
      foundAddedParcel.push(...addedParcelFromCollectedParcel);
      //console.log("addedParcelFromCollectedParcel: " + addedParcelFromCollectedParcel);
    }

    /*
        foundAddedParcel.forEach((foundAddedParcel, index) => {
            console.log(`foundAddedParcel[${index}]:`, foundAddedParcel);
        });
        */

    // Error handling if no collected parcels or added parcels are found
    if (foundCollectedParcels.length === 0 && foundAddedParcel.length === 0) {
      //console.log("error Collected parcel: " + foundCollectedParcels);
      //console.log("error Added parcel: " + foundAddedParcel);
      return res
        .status(404)
        .json({ error: `No parcels found for the date ${formattedDate}` });
    }

    // Calculate profit of the day (sum of prices from collected parcels)
    const profitOfTheDay = foundCollectedParcels.reduce(
      (totalProfit, parcel) => {
        return totalProfit + (parcel.price || 0); // assuming price is a property in collectedParcelSchema
      },
      0
    );

    // Do something with the found parcels and calculated values
    //console.log("Profit of the day: " + profitOfTheDay);
    //console.log("foundCollectedParcels: " + foundCollectedParcels);

    res.status(200).json({
      foundCollectedParcels,
      foundAddedParcel,
      profitOfTheDay,
      formattedDate,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
