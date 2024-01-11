const express = require("express");
const router = express.Router();
const flash = require("express-flash");
router.use(flash());

const { User, Staff } = require("../../middleware/schemamodel");
const { db } = require("../../middleware/setupdb");

router.post("/", async (req, res) => {
    try {
        const { userid } = req.session.user;
        const { discountCode } = req.body;
        const user = await db.collection("users").findOne({ userid });

        const getcoupon = await db.collection("discounts").findOne({ discountCode });
        console.log("🚀 ~ router.post ~ getcoupon:", getcoupon)
        if (!getcoupon) {
            req.flash("alert", "Invalid Discount Coupon");
            return res.redirect("/");
        }
        if ( getcoupon.currentUses >= getcoupon.discountLimit ) {
            req.flash("alert", "Discount Coupon already reached its limit");
            return res.redirect("/");
        } 
        // Check if discountCode already exists in Used_Coupon array
        const discountExists = user.Used_Coupon?.some((coupon) => coupon.discountCode === discountCode);
        if (discountExists) {
            req.flash("alert", "Discount Coupon already used");
            return res.redirect("/");
        }

        // get original price of each parcel
        const priceArray = user.Parcel.map(parcel => parcel.price);
        console.log("🚀 ~ router.post ~ priceArray:", priceArray);

        // get parcelID of each parcel
        const parcelIDArray = user.Parcel.map(parcel => parcel.parcelID);

        // get discount percentage
        const discountPercentage = getcoupon.discountPercentage;

        // calculate discounted price
        const discountedPriceArray = priceArray.map(price => price - (price * (discountPercentage / 100)));
        console.log("🚀 ~ router.post ~ discountedPriceArray:", discountedPriceArray);

        // Update user.Parcel price with the discounted price
        user.Parcel.forEach((parcel, index) => {
            parcel.price = discountedPriceArray[index].toFixed(2);
        });

        // update the user's parcel price in the database
        await db.collection("users").updateOne({ userid }, { $set: { Parcel: user.Parcel } });

        // update the user's parcel price in staff's database based on parcelID
        for (let i = 0; i < parcelIDArray.length; i++) {
            await db.collection("staffs").updateOne({ "locker.parcel.parcelID": parcelIDArray[i] }, { $set: { "locker.$.parcel.price": discountedPriceArray[i] } });
        }

        // create new discount object
        const newDiscount = {
            discountCode: discountCode,
        };

        // update the user's Used_Coupon array in the database
        const result = await db.collection("users").updateOne({ userid }, { $push: { Used_Coupon: newDiscount } });
        console.log("🚀 ~ router.post ~ result:", result)

        // update the discount currentUses in the database
        await db.collection("discounts").updateOne({ discountCode }, { $inc: { currentUses: 1 } });

        return res.redirect("/");
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" }); // Send error response to the client
    }
});


module.exports = router;