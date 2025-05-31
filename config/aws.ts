export const region = process.env.NEXT_AWS_REGION || "eu-central-1";

export const credentials = {
  accessKeyId: process.env.NEXT_AWS_ACCESS_KEY_ID!,
  secretAccessKey: process.env.NEXT_AWS_SECRET_ACCESS_KEY!,
};
