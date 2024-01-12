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


const findParcelsForDateRange = (staff,dates) => {
  const results = [];

  dates.reverse().forEach((date) => {
    const formattedDate = moment(date, 'DD/MM/YYYY').format("DD/MM/YY");

    const foundCollectedParcels = staff.collectedParcel.filter(
      (parcel) => parcel.dateCollected === date
    );
    
    const addedParcelFromLocker = staff.locker
      .filter((locker) => locker.parcel?.dateAdded === date)
      .map((locker) => locker.parcel);
    const addedParcelFromCollectedParcel = staff.collectedParcel.filter(
      (parcel) => parcel.dateAdded === date
    );

    const foundAddedParcel = [];
    if (addedParcelFromLocker.length > 0) {
      foundAddedParcel.push(...addedParcelFromLocker);
    }
    if (addedParcelFromCollectedParcel.length > 0) {
      foundAddedParcel.push(...addedParcelFromCollectedParcel);
    }

    const profitOfTheDay = foundCollectedParcels.reduce(
      (totalProfit, parcel) => totalProfit + (parcel.price || 0),
      0
    );

    results.push({
      date: formattedDate,
      foundCollectedParcels,
      foundAddedParcel,
      profitOfTheDay
    });
  });



  return results;
};

router.post("/", async (req, res) => {
  try {
    const reportDate = req.body.reportDate;
    console.log("original date: " + reportDate);
    const parsedDate = moment(reportDate, 'DD/MM/YYYY');

    const yesterday = parsedDate.clone().subtract(1, 'days').format('DD/MM/YYYY');
    const dayBeforeYesterday = parsedDate.clone().subtract(2, 'days').format('DD/MM/YYYY');
    const dayBeforeBeforeYesterday = parsedDate.clone().subtract(3, 'days').format('DD/MM/YYYY');
    const dayBeforeBeforeBeforeYesterday = parsedDate.clone().subtract(4, 'days').format('DD/MM/YYYY');

    const staff = await db.collection("staffs").findOne({ staffId: req.session.staff.staffId });

    if (!staff) {
      return res.status(404).json({ error: "Staff not found" });
    }

    const dates = [reportDate, yesterday, dayBeforeYesterday, dayBeforeBeforeYesterday, dayBeforeBeforeBeforeYesterday];
    const results = findParcelsForDateRange(staff,dates);

    const foundCollectedParcelsForReportDate = results.find(result => result.date === moment(reportDate, 'DD/MM/YYYY').format("DD/MM/YY"))?.foundCollectedParcels || [];
    if (foundCollectedParcelsForReportDate.length === 0) {
      return res.status(404).json({ error: `No parcels found for the date ${moment(reportDate, 'DD/MM/YYYY').format("D MMM YYYY")}` });
    }

    return res.status(200).json(results);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
