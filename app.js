"use strict";
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const port = process.env.PORT || 4000;
const multer = require("multer");
const fs = require("fs").promises;
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
  // console.log(req.body);

  // console.log(req.files);

  try {
    const ext = await req.body.ext; 
    const files =await req.files;
    let inputPaths = [];
    let outputPaths = [];
    if (files.length != 0) {
      for (let i=0; i<files.length; i++)  {
        inputPaths.push(path.join(__dirname, `/upload/${files[i].filename}`));
        outputPaths.push(
          path.join(
            __dirname,
            `/download/${path.basename(
              files[i].filename,
              path.extname(files[i].filename)
            )}${ext}`
          )
        );
      }
      console.log("Input Paths:", inputPaths);
      console.log("Output Paths:", outputPaths);
      const response=await fileConverter(inputPaths, outputPaths, ext);
      if (response) {
        return res.status(200).json({
          message: response.message,
          filepaths: response.files,
        });
      } else {
        return res.status(500).json({
          message: "File conversion failed",
        });
      }
    } else {
      return res.status(400).json({
        message: "No files uploaded",
      });
    }
    // const inputPath = path.join(__dirname, `/upload/${req.file.filename}`);
    // const outputPath = path.join(
    //   __dirname,
    //   `/download/${path.basename(
    //     req.file.filename,
    //     path.extname(req.file.filename)
    //   )}${ext}`
    // );
    // const filepath = outputPath;
    // const filename = `${req.file.filename}${ext}`;
    // const inputFilePath = inputPath;

    

    // Here in done you have pdf file which you can save or transfer in another stream
  } catch (error) {
    return res.status(500).json({
      message: "File conversion failed",
      error: error.message,
    });
  }
});

app.post('/download_single_file',async(req,res)=>{
  console.log(await req.body.filepath);
  try {
    const filepath=await req.body.filepath; 
    const filename=path.basename(req.body.filepath) 
          res.setHeader(
              "Content-Disposition", 
              `attachment; filename=${filename}` 
            );
            res.setHeader("Content-Type", "file");
            res.download(filepath, filename, (err) => {
              if (err) {
                console.error("Error downloading file:", err);
              } else {
                fs.unlink(`${filepath}`, (err) => {
                  if (err) {
                    console.error("Error deleting file:", err);
                  } else {
                    console.log("File deleted successfully");
                  }
                });
                
              }
            });
  } catch (error) {
    console.log(error)
  }
})

app.listen(port, () => {
  console.log(`hey from ${port}`);
});
module.exports = app;
