"use server";

import {
  GetItemCommand,
  PutItemCommand,
  DeleteItemCommand,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";
import client from "@/lib/dynamodb";

// Get a single blog by ID
export const GET = async (req, { params }) => {
  const { id } = await params;

  if (!id) {
    return Response.json({ error: "ID is required" }, { status: 400 });
  }

  const command = new GetItemCommand({
    TableName: "blogs",
    Key: {
      id: { N: id },
    },
  });

  const { Item } = await client.send(command);

  try {
    await client.send(command);
    return Response.json(Item, { status: 200 });
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

  const { keywords, link, description, title } = await req.json();

  const command = new PutItemCommand({
    TableName: "blogs",
    Item: {
      id: { N: id },
      keywords: { S: keywords },
      link: { S: link },
      description: { S: description },
      modified_date: { S: Date.now().toString() },
      title: { S: title },
      content: {
        L: [
          { M: { type: { S: "heading" }, level: { N: "1" }, text: { S: "Introduction" } } },
          { M: { type: { S: "paragraph" }, text: { S: "This is the introduction to my second blog..." } } },
          { M: { type: { S: "image" }, src: { S: "https://example.com/image2.jpg" }, alt: { S: "Another example image" } } },
          { M: { type: { S: "paragraph" }, text: { S: "Another paragraph with insights." } } }
        ]
      }
    },
  });

// [{ "type": "heading","level": 1,"text": "Introduction"},{"type": "paragraph","text": "This is the introduction to my blog..."},{"type": "image","src": "https://example.com/image1.jpg","alt": "An example image"},{"type": "paragraph","text": "Another paragraph with text."}]
  

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
