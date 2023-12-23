const express = require("express");
const router = express.Router();
const flash = require("express-flash");
router.use(flash());

const { User, Staff } = require("../../middleware/schemamodel");
const { db } = require("../../middleware/setupdb");

router.post("/", async (req, res) => {
  const staffid = req.session.staff.staffId;
  var minWeight = parseFloat(req.body.minWeight);
  var price = parseFloat(req.body.price);

  var setupPrice = {
    minWeight: minWeight,
    price: price,
  };

  const staff = await Staff.findOne({ staffId: staffid });

  let isMatchingMinMax = false;
  let isMatchingPrice = false;

  for (let i = 0; i < staff.pricing.length; i++) {
    const existingPrice = staff.pricing[i];

    if (existingPrice.minWeight === setupPrice.minWeight) {
      isMatchingMinMax = true;

      if (existingPrice.price === setupPrice.price) {
        isMatchingPrice = true;
        break; // Exact match found, no need to continue
      }
    }
  }

  if (isMatchingMinMax && isMatchingPrice) {
    // Existing minWeigh and price match setupPrice values
    // Perform desired action here
    req.flash("alert", "Exact Weight Range and Price already exist");
    console.log("Exact match found.");
    return res.redirect("/staffsetting");
  } else if (isMatchingMinMax && !isMatchingPrice) {
    // Existing minWeight match setupPrice values, but price is different
    // Perform desired action here
    const matchedIndex = staff.pricing.findIndex(
      (existingPrice) => existingPrice.minWeight === setupPrice.minWeight
    );
    if (matchedIndex !== -1) {
      // Update the price of the matched price range at the found index
      await db.collection("staffs").updateOne(
        {
          staffId: staffid,
          "pricing.minWeight": setupPrice.minWeight,
        },
        {
          $set: { "pricing.$.price": setupPrice.price },
        }
      );

      console.log("Updated price for matching minWeight.");
      return res.redirect("/staffsetting");
    } else {
      // Handle the case where the matched index is not found
      console.log("error try again");
      req.flash("alert", "error try again");
      return res.redirect("/staffsetting");
    }
  } else {
    // No matching minWeight found
    // Perform desired action here

    // Push the new price to the pricing array
    await db
      .collection("staffs")
      .updateOne({ staffId: staffid }, { $push: { pricing: setupPrice } });

    // Sort the pricing array based on minWeight in ascending order
    await db
      .collection("staffs")
      .updateOne(
        { staffId: staffid },
        { $push: { pricing: { $each: [], $sort: { minWeight: 1 } } } }
      );

    console.log("New Price Added and Pricing Sorted.");
    return res.redirect("/staffsetting");
  }
});

module.exports = router;
