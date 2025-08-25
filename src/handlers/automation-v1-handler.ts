/**
 * Automation V1 Handler - Handle automation creation with AI-powered contract analysis
 */

import { createAutomationV1 } from "../services/automation-v1-ai.service.js";
import { CreateAutomationV1Params } from "../schemas/automation-v1-schema.js";

export async function automationV1Handler(params: CreateAutomationV1Params) {
  try {
    const result = await createAutomationV1(params);

    if (result.success) {
      return {
        content: [
          {
            type: "text" as const,
            text: `✅ ${
              result.message
            }\n\n🚀 AI-Enhanced Automation Creation Complete!\n\nCreated: ${
              result.automationsCreated
            } automations\nFailed: ${result.automationsFailed} automations\n${
              result.contractAnalyzed
                ? "🧠 Contract Analysis: ✅ Completed\n"
                : "⚠️ Contract Analysis: Not available\n"
            }${
              result.contractSummary
                ? `📊 Contract Summary:\n  • Objects: ${
                    result.contractSummary.objectsCount
                  } (${result.contractSummary.availableObjects.join(
                    ", "
                  )})\n  • Triggers: ${
                    result.contractSummary.triggersCount
                  }\n  • Relationships: ${
                    result.contractSummary.relationshipsCount
                  }\n\n`
                : ""
            }🔧 Automation Results:\n${result.results
              ?.map(
                (r) =>
                  `• ${r.automation}: ${r.status === "success" ? "✅" : "❌"} ${
                    r.status
                  }${r.status === "error" ? ` (${r.error})` : ""}${
                    r.aiEnhanced
                      ? "\n  🤖 AI-Enhanced with contract validation"
                      : ""
                  }${r.contractValidated ? "\n  ✅ Contract validated" : ""}${
                    r.triggerType ? `\n  🎯 Trigger: ${r.triggerType}` : ""
                  }${r.automationId ? `\n  🆔 ID: ${r.automationId}` : ""}`
              )
              .join("\n\n")}`,
          },
        ],
      };
    } else {
      return {
        content: [
          {
            type: "text" as const,
            text: `❌ Failed to create AI automations: ${result.error}\n\n${
              result.contractAnalyzed
                ? "🧠 Contract Analysis: ✅ Completed"
                : "⚠️ Contract Analysis: Failed"
            }`,
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
          text: `❌ Error creating AI automations: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        },
      ],
      isError: true,
    };
  }
}
