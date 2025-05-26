var path = require("path");
const fs = require("fs").promises;
const libre = require("libreoffice-convert");

const fileConverter = async (inputPaths, outputPaths, ext) => {
  try {
    console.log("Input Paths:", await inputPaths);
    console.log("Output Paths:", await outputPaths);
    return new Promise(async (resolve, reject) => {
      for (let i = 0; i < inputPaths.length; i++) {
        // Read file
        const filename = path.basename(outputPaths[i]);
        const filepath = outputPaths[i];
        const docxBuf = await fs.readFile(inputPaths[i]);

        // Convert it to pdf format
        await libre.convert(docxBuf, ext, undefined, async (error, pdfBuf) => {
          if (error) {
            console.log(error);
            reject({ message: "File conversion failed", filename});
          } else {
            await fs
              .writeFile(outputPaths[i], pdfBuf)
              .then(() => {
                fs.unlink(`${inputPaths[i]}`, (err) => {  
                  if (err) {
                    console.error("Error deleting file:", err);
                  } else {
                    console.log("File deleted successfully");
                  }
                });
                console.log("File converted successfully");
              })
              .catch((error) => {
                console.error("Error writing file:", error);
                reject({
                  message: "File conversion failed",
                  filename,
                  
                });
              });
          }
        });
      }
      resolve({
        message: "File converted successfully",
        files: outputPaths,
      });
    });
  } catch (error) {
    console.error("Error in file conversion:", error);
    return {
      status: 500,
      message: "File conversion failed",
      error: error.message,
    };
  }
};

module.exports = fileConverter;
