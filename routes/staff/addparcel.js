const express = require("express");
const router = express.Router();
const moment = require("moment");
const uuid = require("uuid");
const flash = require("express-flash");
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
      return res.render("staff/addparcel", { staffData: staffList, messages: messages });
    }
    return res.redirect("/staffsetting");
  }
  return res.render("guest/error404");
});

router.post("/", async function (req, res) {
  const name = req.body.name;
  const phone = req.body.phone;
  const selectedLocker = req.body.locker;
  const parceltype = req.body.parceltype;
  const tracking = req.body.tracking;
  const studentNumber = req.body.studentNumber;
  const parcelWeight = parseFloat(req.body.parcelWeight);

  // console.log(req.body);

  const staff = await Staff.findOne({ staffId: req.session.staff.staffId });
  const priceRange = staff.pricing;
  //console.log(priceRange);

  const sortedPriceRange = priceRange.sort((a, b) => a.minWeight - b.minWeight);

  let priceRanges = [];

  for (let i = 0; i < sortedPriceRange.length; i++) {
    const current = sortedPriceRange[i];
    const next = sortedPriceRange[i + 1];

    const maxWeight = next ? next.minWeight - 1 : Infinity;

    priceRanges.push({
      minWeight: current.minWeight,
      maxWeight: maxWeight,
      price: current.price,
    });
  }

  console.log(priceRanges);

  function getPriceForWeight(parcelWeight, priceRanges) {
    for (const range of priceRanges) {
      if (parcelWeight < priceRanges[0].minWeight) {
        return priceRanges[0].price;
      }

      if (parcelWeight >= range.minWeight && parcelWeight <= range.maxWeight) {
        return range.price;
      }
    }
    return null; // Return null if weight doesn't fall within any defined range
  }

  const totalPrice = getPriceForWeight(parcelWeight, priceRanges);

  if (totalPrice !== null) {
    console.log(
      `The price for a weight of ${parcelWeight}Kg is RM${totalPrice}.`
    );

    const dateStr = new Date()
      .toLocaleString("en-MY", { timeZone: "Asia/Kuala_Lumpur" })
      .split(",")[0]
      .trim();
    console.log(dateStr);

    // // Split the date string by "/"
    // const dateParts = dateStr.split("/");

    // // Rearrange the parts to format the date as "yyyy-mm-dd"
    // const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
    // const newformattedDate = moment(dateStr).format('DD/MM/YYYY');

    const parcelID = uuid.v4();

    const newparcel = {
      name: name,
      phone: phone,
      studentNumber: studentNumber,
      parceltype: parceltype,
      parcelID: parcelID,
      parcelWeight: parcelWeight,
      tracking: tracking,
      dateAdded: dateStr,
      dateCollected: null,
      isCollected: false,
      price: totalPrice, // Add the calculated price to the parcel object
    };

    // Update the staff document to add the new parcel to the selected locker
    await Staff.updateOne(
      {
        staffId: req.session.staff.staffId,
        "locker.lockerName": selectedLocker,
      },
      {
        $set: {
          "locker.$.isEmpty": false,
          "locker.$.parcel": newparcel,
        },
      },
      { upsert: true }
    );

    // Check if the user with the specified studentNumber exists
    const existingUser = await User.findOne({ studentNumber: studentNumber });
    if (existingUser) {
      // Update the user document to add the new parcel to the Parcel array
      await User.updateOne(
        { studentNumber: studentNumber },
        {
          $push: {
            Parcel: newparcel,
          },
        }
      );
      console.log("\nParcel Added to user account\n", newparcel)
    }

    console.log("\nParcel Added\n", newparcel)

    return res.redirect("/addparcel");
  } else {
    console.log(`No price defined for a weight of ${parcelWeight}Kg.`);

    req.flash(
      "alert",
      `Error Adding Parcel, the price for ${parcelWeight}Kg do not exist, please check pricing setup in setting`
    );

    return res.redirect("/staffsetting");
  }

  //console.log("Debug - Parcel Weight:", parcelWeight);
  //console.log("Debug - Total Price:", totalPrice);
});

module.exports = router;
