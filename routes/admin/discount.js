const express = require("express");
const router = express.Router();
const flash = require("express-flash");
router.use(flash());

const { User, Staff } = require("../../middleware/schemamodel");
const { db } = require("../../middleware/setupdb");

router.get("/", async (req, res) => {
  if (req.session.staff && req.session.staff.isAdmin) {
    const messages = req.flash();
    const discountList = await db.collection("discounts").find().toArray();
    return res.render("admin/discount", {
      discountData: discountList,
      messages: messages,
    });
  }
  return res.render("guest/error404");
});

router.post("/", async (req, res) => {
    try {
        const { discountCode, discountPercentage, discountLimit } = req.body;
        const discountCodeExist = await db.collection("discounts").findOne({ discountCode });

        if (discountCodeExist) {
            req.flash("alert", "Discount code already exists.");
            return res.redirect("/discount");
        }

        const newDiscount = {
            discountCode: discountCode,
            discountPercentage: Number(discountPercentage),
            discountLimit: Number(discountLimit),
            currentUses: 0,
        };

        const result = await db.collection("discounts").insertOne(newDiscount);
        console.log("🚀 ~ router.post ~ result:", result);
        return res.redirect("/discount");
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" }); // Send error response to the client
    }
});


module.exports = router;
