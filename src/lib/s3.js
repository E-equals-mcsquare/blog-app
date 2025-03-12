"use server";

import * as dotenv from "dotenv";
dotenv.config();
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
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

const uploadBlogToS3 = async (blogId, content) => {
  const fileName = `blogs/${blogId}.json`;
  try {
    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: fileName, // Store as a JSON file
        Body: JSON.stringify(content),
        ContentType: "application/json",
      })
    );
    console.log("Blog uploaded successfully to S3!");
    return fileName;
  } catch (error) {
    console.error("Error uploading blog:", error);
  }
};

const getBlogFromS3 = async (blogId) => {
  const fileName = `blogs/${blogId}.json`;
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: fileName,
  });
  try {
    const data = await s3.send(command);
    const bodyContents = await streamToString(data.Body);
    console.log("Blog fetched successfully from S3!", bodyContents);
    return JSON.parse(bodyContents);
  } catch (error) {
    console.error("Error fetching blog:", error);
    return null;
  }
};
const streamToString = (stream) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
  });

export {
  uploadImageToS3,
  createPresignedUrlWithClient,
  uploadBlogToS3,
  getBlogFromS3,
};
