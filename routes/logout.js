const express = require("express");
const router = express.Router();

router.get("/", function (req, res) {
  // destroy the user's session to log them out
  // will be re-created next request
  req.session.destroy(function () {
    res.redirect("/");
  });
  console.log("\nUser logged out");
});

module.exports = router;
