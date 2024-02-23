const express = require("express"); // importing the express package
const multer = require("multer"); // importing the multer package
const fileController = require("../Controllers/fileController"); // importing the fileController
const filerouter = express.Router();

const storage = multer.diskStorage({
  // it takes in two arguments destination where we want to store the images and the filename
  destination: function (req, file, cb) {
    cb(null, "Uploads");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage: storage,
});

// creating a router to upload the files
filerouter.post("/upload", upload.single("image"), fileController.uploadFile);
// creating a router to download the file
filerouter.get("/download/:filename", fileController.downloadFile);

module.exports = filerouter;
