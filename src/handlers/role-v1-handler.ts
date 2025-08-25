/**
 * Role V1 Handler - Create roles with RBAC support and contract analysis
 */

import { CreateRoleV1Params } from "../schemas/role-v1-schema.js";
import { createRoleV1 } from "../services/role-v1.service.js";

export async function createRoleV1Handler(params: CreateRoleV1Params) {
  const result = await createRoleV1(params);

  if (result.success) {
    let responseText = `✅ **Roles Created and Mapped Successfully**

**Summary:**
- Mode: ${result.mode}
- Roles Created: ${result.rolesCreated}
- Objects in Contract: ${result.objectsMapped}

**Created Roles:**
${result.roles?.map((role: string) => `- ${role}`).join("\n") || "No roles"}

**Contract Objects:**
${result.objects?.map((obj: string) => `- ${obj}`).join("\n") || "No objects"}`;

    // Add RBAC-specific details if available
    if (result.rbacSummary) {
      responseText += `

**🔐 RBAC Mapping Analysis:**
- Objects with Permissions Defined: ${result.rbacSummary.mappedObjects.length}
- Objects with Default (False) Permissions: ${
        result.rbacSummary.unmappedObjects.length
      }

**📊 Role Breakdown:**
${Object.entries(result.rbacSummary.rolesBreakdown)
  .map(
    ([roleName, breakdown]: [string, any]) =>
      `- **${roleName}**: ${breakdown.mappedToContract}/${
        breakdown.definedPermissions
      } permissions mapped to contract${
        breakdown.notFoundInContract > 0
          ? ` (${breakdown.notFoundInContract} not found)`
          : ""
      }`
  )
  .join("\n")}`;

      if (result.rbacSummary.unmappedObjects.length > 0) {
        responseText += `

**⚠️ Objects with Default False Permissions:**
${result.rbacSummary.unmappedObjects
  .map((obj: string) => `- ${obj}`)
  .join("\n")}`;
      }
    }

    responseText += `

🎯 All roles are now configured and ready to use!`;

    return {
      content: [
        {
          type: "text" as const,
          text: responseText,
        },
      ],
    };
  } else {
    return {
      content: [
        {
          type: "text" as const,
          text: `❌ **Failed to Create Roles**

Error: ${result.message}

${result.error ? `Details: ${result.error}` : ""}`,
        },
      ],
    };
  }
}
