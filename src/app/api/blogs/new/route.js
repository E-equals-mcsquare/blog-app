"use server";

import { PutItemCommand } from "@aws-sdk/client-dynamodb";
import client from "@/lib/dynamodb";

export const POST = async (req) => {
  console.log("Inside API Handler for New Blog"); // Debugging Log

  if (req.method !== "POST") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  const { blogId, title, s3Filename, description, keywords, content } =
    await req.json();
  console.log("Blog ID:", blogId);
  console.log("Title:", title);
  console.log("S3 Filename:", s3Filename);
  console.log("Description:", description);
  console.log("Keywords:", keywords);

  try {
    // Save content to S3
    let blogS3fileName = await uploadBlogToS3(blogId, {
      title: title.current.value,
      description: description.current.value,
      keywords: keywords.current.value,
      content: blogcontent,
    });

    console.log("Blog uploaded successfully to S3:", blogS3fileName);

    // Save metadata to DynamoDB
    const command = new PutItemCommand({
      TableName: "blogs",
      Item: {
        blogid: { S: blogId },
        title: { S: title },
        filename: { S: blogS3fileName }, // Store the S3 filename
        modifiedat: { S: new Date().toISOString() },
        description: { S: description },
        keywords: { S: keywords },
      },
    });

    await client.send(command);

    return Response.json(
      { message: "Blog metadata saved successfully!", data: blogId },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 400 });
  }
};
