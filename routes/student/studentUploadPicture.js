const express = require("express");
const router = express.Router();
const flash = require("express-flash");
router.use(flash());

const { storage, uploadstudent } = require("../../middleware/multerstudent");

const { db } = require("../../middleware/setupdb");

router.post("/", uploadstudent.single("student-upload-profile-picture"), async (req, res) => {
  const userid = req.session.user.userid;
  // Assuming the upload was successful, get the filename
  const filename = req.file.filename;

  await db
    .collection("users")
    .updateOne(
      { userid: userid },
      { $set: { profilePictureName: filename } },
      { upsert: true }
    );

  // Redirect to the staffsetting page after the upload
  res.redirect("/studentsetting");
});

module.exports = router;
