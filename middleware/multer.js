const multer = require("multer");
const fs = require("fs");
const path = require("path");

// Set up storage for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Specify the directory where you want to store the uploaded files
    const uploadDir = "./public/upload/staff/";
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate a unique filename for the uploaded file
    //const ext = path.extname(file.originalname);
    //const name = path.basename(file.originalname);
    const filename = file.originalname;
    cb(null, filename);
  },
});

// Set up multer middleware
const upload = multer({ storage: storage });

module.exports = {
  storage,
  upload,
};
