const express = require("express");
const multer = require("multer");
const path = require("path");

const router = express.Router();

// Ensure the images folder path is correct
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Use path.join to ensure the correct path
    cb(null, "public/images/");
  },
  filename: (req, file, cb) => {
    cb(null, `${file.originalname}.jpg`);
  },
});

const upload = multer({ storage: storage });

// Define a route to get the URL of an uploaded image
router.get("/get", (req, res) => {

  });

router.post("/create", upload.single("image"), (req, res) => {
  try {
    console.log(req.file); // Log the uploaded file
    // Return a success message or any data you want to send back to the client
    return res.status(200).json({ message: "File uploaded successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" }); // Handle errors appropriately
  }
});

module.exports = router;
