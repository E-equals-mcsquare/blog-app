"use server";

import { ScanCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import client from "@/lib/dynamodb";

export const GET = async () => {
  const command = new ScanCommand({
    TableName: "blogs",
  });

  const { Items } = await client.send(command);

  try {
    await client.send(command);
    return Response.json(Items, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 400 });
  }
};

export const PUT = async () => {
  // Example content structure
  const defaultContent = [
    {
      M: {
        type: { S: "heading" },
        level: { N: "1" },
        text: { S: "Introduction" },
      },
    },
    {
      M: {
        type: { S: "paragraph" },
        text: { S: "This is the introduction to my blog..." },
      },
    },
    {
      M: {
        type: { S: "image" },
        src: { S: "https://example.com/image1.jpg" },
        alt: { S: "An example image" },
      },
    },
    {
      M: {
        type: { S: "paragraph" },
        text: { S: "Another paragraph with text." },
      },
    },
  ];

  const addContentToAllItems = async () => {
    // Step 1: Scan the table to get all existing items
    const scanCommand = new ScanCommand({ TableName: "blogs" });
    const scanResponse = await client.send(scanCommand);

    const items = scanResponse.Items || [];
    try {
      for (const item of items) {
        const blogId = item.id.N; // Primary key (assumes `id` is a Number)
        console.log(`Processing item with id: ${blogId}`);

        // Step 2: Update each item to add 'content' if it doesn't exist
        const updateCommand = new UpdateItemCommand({
          TableName: "blogs",
          Key: { id: { N: blogId } }, // Assuming id is of type Number
          UpdateExpression: "SET #c = :val",
          ExpressionAttributeNames: { "#c": "content" },
          ExpressionAttributeValues: {
            ":val": { L: defaultContent }, // Assigning content as an array of objects
          },
          ConditionExpression: "attribute_not_exists(#c)", // Prevents overriding if already exists
        });

        try {
          await client.send(updateCommand);
          console.log(`Updated item with id: ${blogId}`);
        } catch (error) {
          console.error(`Error updating item ${blogId}:`, error);
        }
      }
      console.log("✅ All items updated with 'content' attribute!");
    } catch (error) {
      console.error(error);
      return Response.json({ error: "Internal server error" }, { status: 500 });
    }
  };

  // Run the function
  addContentToAllItems();
};
