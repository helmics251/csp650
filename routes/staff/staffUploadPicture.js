const express = require("express");
const router = express.Router();
const flash = require("express-flash");
router.use(flash());

const { storage, upload } = require("../../middleware/multer");
//const { User, Staff } = require('../middleware/schemamodel');

const { db } = require("../../middleware/setupdb");

router.post("/", upload.single("upload-profile-picture"), async (req, res) => {
  const staffid = req.session.staff.staffId;
  // Assuming the upload was successful, get the filename
  const filename = req.file.filename;

  await db
    .collection("staffs")
    .updateOne(
      { staffId: staffid },
      { $set: { profilePictureName: filename } },
      { upsert: true }
    );

  // Set the profilePictureUrl in the session
  // req.session.profilePictureUrl = `/upload/staff/${filename}`;

  // Redirect to the staffsetting page after the upload
  res.redirect("/staffsetting");
});

module.exports = router;
