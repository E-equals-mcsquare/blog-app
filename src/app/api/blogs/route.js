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

  // [{"insert":"Lorem Ipsum Lorem Ipsum"},{"attributes":{"header":1},"insert":"\n"},{"insert":"Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum "},{"attributes":{"header":2},"insert":"\n"},{"insert":"Lorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem Ipsum\n"}]

  const defaultContent = [
    {
      M: {
        insert: { S: "Lorem Ipsum Lorem Ipsum" },
      },
    },
    {
      M: {
        attributes: { M: { header: { N: "1" } } },
        insert: { S: "\n" },
      },
    },
    {
      M: {
        insert: { S: "Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum " },
      },
    },
    {
      M: {
        attributes: { M: { header: { N: "2" } } },
        insert: { S: "\n" },
      },
    },
    {
      M: {
        insert: { S: "Lorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem Ipsum\n" },
      },
    },
    {
      M: {
        insert: { M: { image: { S: "https://th.bing.com/th/id/OIP.Fll7WPtNT6jrz1oBP8GbCgHaHj?w=152&h=180&c=7&r=0&o=5&dpr=2&pid=1.7" } } },
      }
    }
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
