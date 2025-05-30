import { credentials, region } from "@/config/aws";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

export const dynamo = new DynamoDBClient({ region, credentials });
