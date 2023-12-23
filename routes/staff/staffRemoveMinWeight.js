const express = require("express");
const router = express.Router();
const flash = require("express-flash");
router.use(flash());

const { User, Staff } = require("../../middleware/schemamodel");
const { db } = require("../../middleware/setupdb");

router.post("/", async (req, res) => {
  console.log(req.body);
  const minWeight = req.body.minWeight;

  const result = await Staff.updateOne(
    { staffId: req.session.staff.staffId },
    {
      $pull: {
        pricing: { minWeight: minWeight },
      },
    }
  );
  console.log(result);

  return res.redirect("/staffsetting");
});

module.exports = router;
