/**
 * App V1 Handler - Simple app creation
 */

import { CreateAppV1Params } from "../schemas/app-v1-schema.js";
import { createAppV1 } from "../services/app-v1.service.js";

export async function createAppV1Handler(params: CreateAppV1Params) {
  const result = await createAppV1(params);

  if (result.success) {
    return {
      content: [
        {
          type: "text" as const,
          text: `✅ **App Created Successfully**

**App Details:**
- Name: ${result.appName}
- App ID: ${result.appId}
- App Slug: ${result.appSlug}

Ready for next steps: objects, SOT, and roles creation.`,
        },
      ],
    };
  } else {
    return {
      content: [
        {
          type: "text" as const,
          text: `❌ **Failed to Create App**

Error: ${result.message}

${result.error ? `Details: ${result.error}` : ""}`,
        },
      ],
    };
  }
}
