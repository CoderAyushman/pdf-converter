const dotenv = require('dotenv');
dotenv.config();
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";
const mime = require('mime-types');

// Initialize the S3 client
const s3 = new S3Client({
  region: process.env.AWS_REGION ,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function uploadToS3(filePath) {
    try {
      const fileContent = fs.readFileSync(filePath);
      const fileName = path.basename(filePath);
      const mimeType = mime.lookup(filePath);
      const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: fileName,
        Body: fileContent,
        ContentType: mimeType
  
      };
  
      const command = new PutObjectCommand(params);
      await s3.send(command);
  
      const fileUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
      console.log(`File uploaded successfully. URL: ${fileUrl}`);
      return fileUrl;
    } catch (error) {
      console.error(`Error uploading to S3: ${error.message}`);
      throw error;
    }
  }
module.exports=uploadToS3;
