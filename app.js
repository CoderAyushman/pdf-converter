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
const { error } = require("console");
const fileConverter = require("./components/fileConverter");
libre.convertAsync = require("util").promisify(libre.convert);
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
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
  try {
    const ext = req.body.ext?.trim();
    const files = req.files;
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

    if (!rawPath) {
      return res.status(400).json({ message: "Filepath not provided" });
    }

    // Prevent access outside allowed folders
    // const safeBase = path.join(__dirname, 'download');
    // const filepath = path.resolve(rawPath);

    if (!filepath.startsWith(safeBase)) {
      return res.status(403).json({ message: "Access denied" });
    }

    // const filename = path.basename(filepath);
    const filename = `file.pdf`;

    if (!fs.existsSync(rawPath)) {
      return res.status(404).json({ message: "File not found" });
    }

    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
    res.setHeader("Content-Type", "application/octet-stream");

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
