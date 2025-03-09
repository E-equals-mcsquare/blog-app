import client from "@/lib/dynamodb";
import { ScanCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";

// Example content structure
const defaultContent = [
    { M: { type: { S: "heading" }, level: { N: "1" }, text: { S: "Introduction" } } },
    { M: { type: { S: "paragraph" }, text: { S: "This is the introduction to my blog..." } } },
    { M: { type: { S: "image" }, src: { S: "https://example.com/image1.jpg" }, alt: { S: "An example image" } } },
    { M: { type: { S: "paragraph" }, text: { S: "Another paragraph with text." } } }
  ];
  
  async function addContentToAllItems() {
    // Step 1: Scan the table to get all existing items
    const scanCommand = new ScanCommand({ TableName: tableName });
    const scanResponse = await client.send(scanCommand);
  
    const items = scanResponse.Items || [];
    
    for (const item of items) {
      const blogId = item.id; // Primary key (assumes `id` is a String)
  
      // Step 2: Update each item to add 'content' if it doesn't exist
      const updateCommand = new UpdateItemCommand({
        TableName: tableName,
        Key: { id: { S: blogId.S } }, // Assuming id is of type String
        UpdateExpression: "SET #c = :val",
        ExpressionAttributeNames: { "#c": "content" },
        ExpressionAttributeValues: {
          ":val": { L: defaultContent }, // Assigning content as an array of objects
        },
        ConditionExpression: "attribute_not_exists(#c)", // Prevents overriding if already exists
      });
  
      try {
        await client.send(updateCommand);
        console.log(`Updated item with id: ${blogId.S}`);
      } catch (error) {
        console.error(`Error updating item ${blogId.S}:`, error);
      }
    }
  
    console.log("✅ All items updated with 'content' attribute!");
  }
  
  // Run the function
  addContentToAllItems();