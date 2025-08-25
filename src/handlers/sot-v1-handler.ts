/**
 * SOT V1 Handler - Create objects with attributes and SOT
 */

import { CreateSOTV1Params } from "../schemas/sot-v1-schema.js";
import { createSOTV1 } from "../services/sot-v1.service.js";

export async function createSOTV1Handler(params: CreateSOTV1Params) {
  const result = await createSOTV1(params);

  if (result.success) {
    return {
      content: [
        {
          type: "text" as const,
          text: `✅ **Objects and SOT Created Successfully**

**Summary:**
- Objects Created: ${result.objectsCreated}
- SOT Configurations: ${result.sotCreated}

**Steps Executed:**
${
  result.results
    ?.map((r: any) => `- ${r.step}: ${r.status} - ${r.message}`)
    .join("\n") || "No steps recorded"
}

All objects with attributes and SOT are ready!`,
        },
      ],
    };
  } else {
    return {
      content: [
        {
          type: "text" as const,
          text: `❌ **Failed to Create Objects and SOT**

Error: ${result.message}

${result.error ? `Details: ${result.error}` : ""}`,
        },
      ],
    };
  }
}
