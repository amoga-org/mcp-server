/**
 * Publish V1 Handler - Handle application publishing for V1 architecture
 */

import { publishV1 } from "../services/publish-v1.service.js";
import { PublishV1Params } from "../schemas/publish-v1-schema.js";

export async function publishV1Handler(params: PublishV1Params) {
  try {
    const result = await publishV1(params);

    if (result.success) {
      return {
        content: [
          {
            type: "text" as const,
            text: `${result.message}\n\nApp ID: ${result.data?.appId}\nVersion: ${result.data?.version}\n\nPublish completed successfully! ✅`,
          },
        ],
      };
    } else {
      return {
        content: [
          {
            type: "text" as const,
            text: `❌ ${result.message}\n\nError: ${result.error}`,
          },
        ],
        isError: true,
      };
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text" as const,
          text: `❌ Error publishing application: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        },
      ],
      isError: true,
    };
  }
}
