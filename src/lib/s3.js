"use server";

import * as dotenv from "dotenv";
dotenv.config();
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
// import {readFile} from "node:fs/promises";
// import { fromIni } from "@aws-sdk/credential-provider-ini";
// import { fromNodeProviderChain } from "@aws-sdk/credential-provider-node";

// Determine credentials dynamically
const getCredentials = () => {
  if (process.env.NODE_ENV === "development") {
    // Use local credentials file when running locally
    return {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    };
  } else {
    // Use IAM role-based authentication when deployed in AWS
    // return fromNodeProviderChain();
  }
};

const region = "ap-south-1";
const bucket = "my-portfolio-blog-images";

const s3 = new S3Client({
  region: "ap-south-1",
  credentials: getCredentials(),
});

const uploadImageToS3 = async (base64Image) => {
  const blob = await fetch(base64Image).then((res) => res.blob()); // Convert base64 to Blob
  const file = new File([blob], `image-${Date.now()}.png`, { type: blob.type }); // Convert Blob to File

  const fileName = `screenshots/${Date.now()}-${file.name}`;
  const fileBuffer = await file.arrayBuffer();

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: fileName,
    Body: fileBuffer,
  });
  try {
    await s3.send(command);
    return fileName;
  } catch (error) {
    console.error("Error uploading file:", error);
    return null;
  }
};

/* const getSignedUrl = async (key) => {
    const params = {
      Bucket: bucket,
      Key: key,
      Expires: 300 // URL expires in 5 minutes
    };
    return await s3.("getObject", params);
  }; */

  const createPresignedUrlWithClient = (key) => {
    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    return getSignedUrl(s3, command, { expiresIn: 3600 });
  };
export {uploadImageToS3, createPresignedUrlWithClient};
