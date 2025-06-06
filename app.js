"use strict";
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const port = process.env.PORT || 4000;
const multer = require("multer");
const fs = require("fs");
var app = express();
const libre = require("libreoffice-convert");
const cors = require("cors");
const fileConverter = require("./components/fileConverter");
libre.convertAsync = require("util").promisify(libre.convert);
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
const mime = require("mime-types");
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", function (req, res, next) {
  return res.render("homepage");
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./upload");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      `${path.basename(
        file.originalname,
        path.extname(file.originalname)
      )}_${Date.now()}${path.extname(file.originalname)}`
    );
  },
});
const upload = multer({ storage: storage });
// let filepath;
// let filename;
// let inputFilePath;

app.post("/upload", upload.array("files"), async (req, res) => {
  console.log("Files uploaded:",await req.files);
  try {
    const ext =await req.body.ext
    const files =await req.files;
    const inputPaths = [];
    const outputPaths = [];

    if (!ext) {
      return res.status(400).json({ message: "No extension provided" });
    }

    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    for (const file of files) {
      const inputPath = path.join(__dirname, 'upload', file.filename);
      const outputPath = path.join(
        __dirname,
        'download',
        `${path.basename(file.filename, path.extname(file.filename))}${ext}`
      );

      inputPaths.push(inputPath);
      outputPaths.push(outputPath);
    }

    console.log("Input Paths:", inputPaths);
    console.log("Output Paths:", outputPaths);

    const response = await fileConverter(inputPaths, outputPaths, ext);

    if (response) {
      console.log("Conversion successful:", response);
      setTimeout(() => {
        // Delete input files after conversion
        outputPaths?.forEach((outputPath) => {
          fs.unlink(outputPath, (err) => {
            if (err) {
              console.error("Error deleting input file:", err);
            } else {
              console.log("Input file deleted:", outputPath);
            }
          });
        });
      }, 60000);
      return res.status(200).json({
        message: response.message,
        filepaths: response.files, // return absolute paths if you use them in download
      });
    }

    return res.status(500).json({ message: "File conversion failed" });

  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({
      message: "File conversion failed",
      error: error.message,
    });
  }
});

app.post('/download_single_file', async (req, res) => {
  try {
    const rawPath = req.body.filepath;
    console.log("Raw Path:", rawPath);

    if (!rawPath) {
      return res.status(400).json({ message: "Filepath not provided" });
    }

    // Prevent access outside allowed folders
    const filepath =rawPath;
    const filename =rawPath.split("/").pop();
    const fileMimeType =  mime.lookup(filepath) || "application/octet-stream";
    // const safeBase = path.join(__dirname, 'download');
    // const filepath = path.resolve(rawPath);

    

    // const filename = path.basename(filepath);

    if (!fs.existsSync(rawPath)) {
      return res.status(404).json({ message: "File not found" });
    }

    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
    res.setHeader("Content-Type", fileMimeType);

    res.download(filepath, filename, (err) => {
      if (err) {
        console.error("Download error:", err);
      } else {
        fs.unlink(filepath, (err) => {
          if (err) {
            console.error("Error deleting file:", err);
          } else {
            console.log("File deleted:", filename);
          }
        });
      }
    });
  } catch (error) {
    console.error("Download error:", error);
    return res.status(500).json({
      message: "Download failed",
      error: error.message,
    });
  }
});

app.listen(port, () => {
  console.log(`hey from ${port}`);
});
module.exports = app;
