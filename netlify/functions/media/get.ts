import type { Handler } from "@netlify/functions";
import { ScanCommand, type AttributeValue } from "@aws-sdk/client-dynamodb";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "@/lib/s3";
import { dynamo } from "@/lib/dynamo";

const BUCKET_NAME = process.env.NEXT_S3_BUCKET_NAME!;
const MEDIA_TABLE = process.env.NEXT_DYNAMODB_MEDIA_TABLE_NAME!;

export const handler: Handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
  };

  try {
    const { cursor, limit = "20" } = event.queryStringParameters || {};

    // Filtered scan for paginated results
    const scanParams: any = {
      TableName: MEDIA_TABLE,
      FilterExpression: "#status = :status",
      ExpressionAttributeNames: { "#status": "status" },
      ExpressionAttributeValues: { ":status": { S: "completed" } },
      Limit: Number.parseInt(limit),
    };

    if (cursor) {
      scanParams.ExclusiveStartKey = JSON.parse(
        Buffer.from(cursor, "base64").toString()
      );
    }

    const result = await dynamo.send(new ScanCommand(scanParams));

    // Full scan for total item count (unfiltered)
    const totalCountResult = await dynamo.send(
      new ScanCommand({
        TableName: MEDIA_TABLE,
        Select: "COUNT",
      })
    );

    const media = await Promise.all(
      (result.Items || []).map(async (item: Record<string, AttributeValue>) => {
        const url = await getSignedUrl(
          s3,
          new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: item.s3Key.S!,
          }),
          { expiresIn: 3600 }
        );

        return {
          id: item.id.S!,
          type: item.fileType.S!.startsWith("video/") ? "video" : "image",
          url,
          name: item.fileName.S!,
          uploadedAt: new Date(item.uploadedAt.S!),
          guestName: item.guestName.S!,
          size: Number(item.fileSize.N!),
          s3Key: item.s3Key.S!,
        };
      })
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        media,
        nextCursor: result.LastEvaluatedKey
          ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString(
              "base64"
            )
          : undefined,
        hasMore: !!result.LastEvaluatedKey,
        total: totalCountResult.Count || 0,
      }),
    };
  } catch (error) {
    console.error("Error fetching media:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
};
