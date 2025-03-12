"use server";

import {
  GetItemCommand,
  PutItemCommand,
  DeleteItemCommand,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";
import client from "@/lib/dynamodb";
import { getBlogFromS3 } from "@/lib/s3";

// Get a single blog metadata from DynamoDB by ID
export const GET = async (req, { params }) => {
  const { id } = await params;

  if (!id) {
    return Response.json({ error: "ID is required" }, { status: 400 });
  }
  try {
    const command = new GetItemCommand({
      TableName: "blogs",
      Key: {
        blogid: { S: id },
      },
    });

    const { Item } = await client.send(command);

    // Get content from S3
    const content = await getBlogFromS3(id);

    return Response.json({ Item, content }, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 400 });
  }
};

// Update a single blog by ID
export const PUT = async (req, { params }) => {
  const { id } = await params;
  console.log("id", id);

  if (!id) {
    return Response.json({ error: "ID is required" }, { status: 400 });
  }

  const { keywords, link, description, title, content } = await req.json();

  let dbContent = {
    L: content.ops.map((obj) => {
      let item = { M: {} };

      if (obj.attributes?.header) {
        item.M.type = { S: "heading" };
        item.M.level = { N: obj.attributes.header.toString() };
        item.M.text = { S: obj.insert };
      }

      if (obj.insert.image) {
        item.M.type = { S: "image" };
        item.M.src = { S: obj.insert.image };
        item.M.alt = { S: "" };
      } else {
        item.M.type = { S: "paragraph" };
        item.M.text = { S: obj.insert };
      }

      return item;
    }),
  };

  console.log("dbContent", JSON.stringify(dbContent));

  const command = new UpdateItemCommand({
    TableName: "blogs",
    Key: {
      id: { N: id },
    },
    UpdateExpression: `SET 
        ${keywords ? "#k = :keywords," : ""}
        ${link ? "#l = :link," : ""}
        ${description ? "#d = :description," : ""}
        #md = :modified_date,
        ${title ? "#t = :title," : ""}
        ${content ? "#c = :content" : ""}`.replace(/,\s*$/, ""), // Remove trailing comma
    ExpressionAttributeNames: {
      ...(keywords && { "#k": "keywords" }),
      ...(link && { "#l": "link" }),
      ...(description && { "#d": "description" }),
      "#md": "modified_date",
      ...(title && { "#t": "title" }),
      ...(content && { "#c": "content" }),
    },
    ExpressionAttributeValues: {
      ...(keywords && { ":keywords": { S: keywords } }),
      ...(link && { ":link": { S: link } }),
      ...(description && { ":description": { S: description } }),
      ":modified_date": { S: Date.now().toString() },
      ...(title && { ":title": { S: title } }),
      ...(content && { ":content": dbContent }),
    },
  });

  try {
    await client.send(command);
    return Response.json(
      { message: "Blog updated successfully!" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 400 });
  }
};

// Delete a single blog by ID
export const DELETE = async (req, { params }) => {
  const { id } = await params;

  if (!id) {
    return Response.json({ error: "ID is required" }, { status: 400 });
  }

  const command = new DeleteItemCommand({
    TableName: "blogs",
    Key: {
      id: { N: id },
    },
  });

  try {
    await client.send(command);
    return Response.json(
      { message: "Blog deleted successfully!" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 400 });
  }
};
