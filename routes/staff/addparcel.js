const express = require("express");
const router = express.Router();
const uuid = require("uuid");
const flash = require("express-flash");
router.use(flash());

const { User, Staff } = require("../../middleware/schemamodel");
const { db } = require("../../middleware/setupdb");

router.get("/", async (req, res) => {
  if (req.session.staff) {
    const staffList = await Staff.findOne({
      staffId: req.session.staff.staffId,
    });
    const messages = req.flash();

    res.render("staff/addparcel", { staffData: staffList, messages: messages });
  }
});

router.post("/", async function (req, res) {
  var name = req.body.name;
  var phone = req.body.phone;
  var selectedLocker = req.body.locker;
  var parceltype = req.body.parceltype;
  var tracking = req.body.tracking;
  var studentNumber = req.body.studentNumber;
  var parcelWeight = parseFloat(req.body.parcelWeight);

  // Adjusted pricing logic

  /*
  var totalPrice = 0;

  if (parcelWeight <= 1) {
      totalPrice = 1;
  } else if (parcelWeight <= 5) {
      totalPrice = 2;
  } else if (parcelWeight <= 10) {
      totalPrice = 5;
  } else {
      totalPrice = 10;
  }
  */

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

    var dateStr = new Date()
      .toLocaleString("en-MY", { timeZone: "Asia/Kuala_Lumpur" })
      .split(",")[0]
      .trim();

    // Split the date string by "/"
    var dateParts = dateStr.split("/");

    // Rearrange the parts to format the date as "yyyy-mm-dd"
    var formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;

    var parcelID = uuid.v4();

    var newparcel = {
      name: name,
      phone: phone,
      studentNumber: studentNumber,
      parceltype: parceltype,
      parcelID: parcelID,
      parcelWeight: parcelWeight,
      tracking: tracking,
      dateAdded: formattedDate,
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
      //console.log("\nParcel Added to user account\n", newparcel)
    }

    //console.log("\nParcel Added\n", newparcel)

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
