import type { Handler } from "@netlify/functions";
import { UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { dynamo } from "@/lib/dynamo";

const MEDIA_TABLE = process.env.DYNAMODB_MEDIA_TABLE_NAME!;

export const handler: Handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS")
    return { statusCode: 200, headers, body: "" };
  if (event.httpMethod !== "POST")
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };

  try {
    const { mediaId } = JSON.parse(event.body || "{}");
    if (!mediaId)
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Missing mediaId" }),
      };

    await dynamo.send(
      new UpdateItemCommand({
        TableName: MEDIA_TABLE,
        Key: { id: { S: mediaId } },
        UpdateExpression: "SET #status = :status, completedAt = :completedAt",
        ExpressionAttributeNames: { "#status": "status" },
        ExpressionAttributeValues: {
          ":status": { S: "completed" },
          ":completedAt": { S: new Date().toISOString() },
        },
      })
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    console.error("Error completing upload:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
};
