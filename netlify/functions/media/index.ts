import type { Handler } from "@netlify/functions";
import { handler as getHandler } from "./get";
import { handler as postHandler } from "./post";
import { handler as patchHandler } from "./patch";

export const handler: Handler = async (event, context) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
      },
      body: "",
    };
  }

  // Route to the appropriate handler based on HTTP method
  switch (event.httpMethod) {
    case "GET":
      return await getHandler(event, context);
    case "POST":
      return await postHandler(event, context);
    case "PATCH":
      return await patchHandler(event, context);
    default:
      return {
        statusCode: 405,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ error: "Method not allowed" }),
      };
  }
};
