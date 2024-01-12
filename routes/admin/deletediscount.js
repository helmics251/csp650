const express = require("express");
const router = express.Router();
const flash = require("express-flash");
router.use(flash());

const { User, Staff } = require("../../middleware/schemamodel");
const { db } = require("../../middleware/setupdb");

router.post("/", async function (req, res) {
    try {
        const {discountCode} = req.body;
        console.log("🚀 ~ discountCode:", discountCode)
        
        const result = await db.collection("discounts").deleteOne({discountCode});
        console.log("🚀 ~ result:", result)
        return res.redirect("/discount");
    } catch (error) {
        // Handle errors appropriately
        console.error("Error:", error);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;