'use server';

import { PutItemCommand } from "@aws-sdk/client-dynamodb";
import client from "@/lib/dynamodb";

export const POST = async (req) => {
    console.log("Inside API Handler for New Blog");  // Debugging Log

    if (req.method !== 'POST') {
        res.status(405).json({ message: 'Method not allowed' });
        return;
    }

    const { keywords, link, description, title } = await req.json();

    const command = new PutItemCommand({
        TableName: "blogs",
        Item: {
            id: { N: Math.random().toString() },
            keywords: { S: keywords },
            link: { S: link },
            description: { S: description },
            modified_date: { S: Date.now().toString() },
            title: { S: title },
            
        },
    });

    try {
        await client.send(command);
        return Response.json({ message: "Blog added successfully!", data: req.json() }, { status: 201 });
    } catch (error) {
        console.error(error);
        return Response.json({ error: "Internal server error" }, { status: 400 });
    }
}
