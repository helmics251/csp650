const express = require("express");
const router = express.Router();
const flash = require("express-flash");
router.use(flash());

const { User, Staff } = require("../../middleware/schemamodel");
const { db } = require("../../middleware/setupdb");

router.post("/", async function (req, res) {
    try {
        // Get user input
        const STAFFID = req.body.STAFFID;

        // Delete record from the "Staff" collection
        await Staff.deleteOne({ staffId: STAFFID });

        // Log successful deletion
        console.log(`Record with staffId ${STAFFID} deleted successfully`);

        // Redirect after successful delete record
        res.redirect("/manageStaff");
    } catch (error) {
        // Handle errors appropriately
        console.error("Error:", error);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;
