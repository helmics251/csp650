const express = require("express");
const router = express.Router();
const flash = require("express-flash");
router.use(flash());

const { User, Staff } = require("../../middleware/schemamodel");
const { db } = require("../../middleware/setupdb");

router.post("/", async function (req, res) {
  const staffid = req.session.staff.staffId;
  const parcelID = req.body.parcelID;
  const currentLocker = req.body.currentLocker;
  const selectedLocker = req.body.locker; // changed variable name for clarity
  const name = req.body.name;
  const phone = req.body.phone.toString();
  const parceltype = req.body.parceltype;
  const parcelWeight =req.body.parcelWeight;

  let updateParcel = {};

  if (name) {
    updateParcel.name = name;
  }
  if (phone) {
    updateParcel.phone = phone;
  }
  if (parceltype) {
    updateParcel.parceltype = parceltype;
  }
  if (parcelWeight) {
    const staff = await Staff.findOne({ staffId: staffid });
    const priceRange = staff.pricing;
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

      updateParcel.parcelWeight = parcelWeight;
      updateParcel.price = totalPrice;
    } else {
      console.log(`No price defined for a weight of ${parcelWeight}Kg.`);
      req.flash(
        "alert",
        `Error Editing Parcel weight, the price for ${parcelWeight}Kg do not exist, please check pricing setup in setting`
      );
      return res.redirect("/staffsetting");
    }
  }

  // Find the current locker and get the entire parcel information
  const currentLockerInfo = await Staff.findOne(
    {
      staffId: staffid,
      "locker.lockerName": currentLocker,
    },
    { "locker.$": 1 }
  );
  const currentParcelInfo = currentLockerInfo.locker[0].parcel;

  // If selectedLocker is provided, move the parcel to the selected locker
  if (selectedLocker) {
    // Move parcel to the selected locker

    /*console.log(`\nupdateParcel:\n${JSON.stringify(updateParcel, null, 2)}`);
    console.log(`\ncurrentLockerInfo:\n${JSON.stringify(currentLockerInfo, null, 2)}`);
    console.log(`\ncurrentParcelInfo:\n${JSON.stringify(currentParcelInfo, null, 2)}`);*/

    //emptying current locker

    await Staff.updateOne(
      {
        staffId: req.session.staff.staffId,
        "locker.lockerName": currentLocker,
      },
      {
        $set: {
          "locker.$.isEmpty": true,
          "locker.$.parcel": null,
        },
      }
    );

    //move locker, update new locker

    await Staff.updateOne(
      {
        staffId: req.session.staff.staffId,
        "locker.lockerName": selectedLocker,
      },
      {
        $set: {
          "locker.$.isEmpty": false,
          "locker.$.parcel": { ...currentParcelInfo, ...updateParcel },
        },
      },
      { upsert: true }
    );
    // Log the merged data
    console.log("\nMerged Data:", { ...currentParcelInfo, ...updateParcel });
  } else {
    // Update parcel in the current locker
    await Staff.updateOne(
      {
        staffId: staffid,
        "locker.lockerName": currentLocker,
      },
      {
        $set: {
          "locker.$.parcel": { ...currentParcelInfo, ...updateParcel },
        },
      }
    );
    console.log("\nParcel Updated", { ...currentParcelInfo, ...updateParcel });
  }

  res.redirect("/parcelList");
});

module.exports = router;
