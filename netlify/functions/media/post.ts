import type { Handler } from "@netlify/functions";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutItemCommand, ScanCommand } from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { s3 } from "@/lib/s3";
import { dynamo } from "@/lib/dynamo";

const BUCKET_NAME = process.env.NEXT_S3_BUCKET_NAME!;
const MEDIA_TABLE = process.env.NEXT_DYNAMODB_MEDIA_TABLE_NAME!;
const GUESTS_TABLE = process.env.NEXT_DYNAMODB_GUESTS_TABLE_NAME!;

export const handler: Handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  try {
    const { fileName, fileType, fileSize, guestName } = JSON.parse(
      event.body || "{}"
    );
    if (!fileName || !fileType || !fileSize || !guestName) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Missing required fields" }),
      };
    }

    // Check if guest already exists
    const { Items: guests } = await dynamo
      .send(
        new ScanCommand({
          TableName: GUESTS_TABLE,
          FilterExpression: "#name = :name",
          ExpressionAttributeNames: { "#name": "name" },
          ExpressionAttributeValues: { ":name": { S: guestName } },
          Limit: 1,
        })
      )
      .catch(() => ({ Items: [] })); // If index doesn't exist, handle gracefully

    // Use existing guest ID or create new one
    let guestId: string;
    if (guests && guests.length > 0) {
      guestId = guests["0"].id.S!;
    } else {
      guestId = uuidv4();
    }

    const mediaId = uuidv4();
    const [timestamp] = new Date().toISOString().split("T");
    const s3Key = `uploads/${timestamp}/${mediaId}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
      ContentType: fileType,
      Metadata: {
        guestName,
        guestId,
        uploadedAt: timestamp,
      },
    });
    const uploadUrl = await getSignedUrl(s3, command, {
      expiresIn: 3600,
    });

    await dynamo.send(
      new PutItemCommand({
        TableName: MEDIA_TABLE,
        Item: {
          id: { S: mediaId },
          fileName: { S: fileName },
          fileType: { S: fileType },
          fileSize: { N: fileSize.toString() },
          s3Key: { S: s3Key },
          guestId: { S: guestId },
          guestName: { S: guestName },
          uploadedAt: { S: timestamp },
          status: { S: "pending" },
        },
      })
    );

    // Only create a new guest record if one doesn't exist
    if (!guests || guests.length === 0) {
      await dynamo
        .send(
          new PutItemCommand({
            TableName: GUESTS_TABLE,
            Item: {
              id: { S: guestId },
              name: { S: guestName },
              createdAt: { S: timestamp },
              lastUpload: { S: timestamp },
            },
          })
        )
        .catch(console.log);
    } else {
      // Update the lastUpload timestamp for existing guest
      await dynamo
        .send(
          new PutItemCommand({
            TableName: GUESTS_TABLE,
            Item: {
              id: { S: guestId },
              name: { S: guestName },
              lastUpload: { S: timestamp },
            },
          })
        )
        .catch(console.log);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ uploadUrl, mediaId, s3Key }),
    };
  } catch (error) {
    console.error("Error generating upload URL:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
};
