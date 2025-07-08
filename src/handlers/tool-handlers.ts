/**
 * Tool handlers for the MCP server
 * This file contains all the tool implementation handlers
 */

import { z } from "zod";
import {
  createApp,
  getAllApps,
  deleteApp,
  getAppContract,
  createObject,
  createSot,
  deleteObject,
  createUpdateRoles,
  publishApp,
} from "../services/app.service.js";
import {
  CreateAppParams,
  GetAppsParams,
  DeleteAppParams,
  GetAppContractParams,
  CreateObjectParams,
  CreateSotParams,
  DeleteObjectParams,
  CreateUpdateRolesParams,
  CreateAttributeParams,
  PublishAppParams,
  CheckPublishStatusParams,
  GenerateWorkflowParams,
  CreateAutomationParams,
  CreateNavbarParams,
  GetAppPagesParams,
  CreateJobTitleParams,
  CreateUserParams,
} from "../types/app.types.js";
import { createAttributeHandler } from "./attribute-handler.js";
import { createDummyDataHandler } from "./dummy-data-handler.js";
import { DummyDataSchema } from "../schemas/dummy-data-schema.js";
import {
  monitorPublishStatus,
  formatStatusOutput,
} from "../services/publish-status.service.js";
import { generateWorkflows } from "../services/workflow.service.js";
import { createAutomation } from "../services/automation.service.js";
import { createNavbar } from "../services/navbar.service.js";
import { getAppPages } from "../services/app-pages.service.js";
import { createJobTitle } from "../services/job-title.service.js";
import { createUser } from "../services/create-user.service.js";
import { CreateNavbarSchema } from "../types/app.types.js";

export const toolHandlers = {
  // Create a new application
  "create-app": async (params: CreateAppParams) => {
    try {
      const { appId, appSlug } = await createApp(params);
      return {
        content: [
          {
            type: "text" as const,
            text: `✅ Application "${params.appName}" created successfully with ID: ${appId}`,
          },
        ],
      };
    } catch (err: any) {
      return {
        content: [
          {
            type: "text" as const,
            text: `❌ Failed to create application: ${err.message || err}`,
          },
        ],
      };
    }
  },

  // Get all applications for a tenant
  "get-apps": async (params: GetAppsParams) => {
    try {
      const apps = await getAllApps(params);
      return {
        content: [
          {
            type: "text" as const,
            text:
              `✅ Found ${apps.length} applications:\n` +
              apps.map((a: any) => `- ${a.application_name}`).join("\n"),
          },
        ],
      };
    } catch (err: any) {
      return {
        content: [
          {
            type: "text" as const,
            text: `❌ Failed to get apps: ${err.message || err}`,
          },
        ],
      };
    }
  },

  // Delete an application
  "delete-app": async (params: DeleteAppParams) => {
    try {
      await deleteApp(params);
      return {
        content: [
          {
            type: "text" as const,
            text: `✅ Application with ID ${params.appId} has been deleted successfully.`,
          },
        ],
      };
    } catch (err: any) {
      return {
        content: [
          {
            type: "text" as const,
            text: `❌ Failed to delete application: ${err.message || err}`,
          },
        ],
      };
    }
  },

  // Get app contract
  "get-app-contract": async (params: GetAppContractParams) => {
    try {
      const contractJson = await getAppContract(params);
      return {
        content: [
          {
            type: "text" as const,
            text: `✅ Found ${JSON.stringify(contractJson)}`,
          },
        ],
      };
    } catch (err: any) {
      return {
        content: [
          {
            type: "text" as const,
            text: `❌ ${err.message || err}`,
          },
        ],
      };
    }
  },

  // Create objects with attributes, statuses, and relationships
  "create-object": async (params: CreateObjectParams) => {
    try {
      const contractJson = await createObject(params);
      return {
        content: [
          {
            type: "text" as const,
            text: `✅ Objects created successfully for app ${
              params.appId
            } or JSON:${JSON.stringify(contractJson)}`,
          },
        ],
      };
    } catch (err: any) {
      return {
        content: [
          {
            type: "text" as const,
            text: `❌ Failed to create objects: ${err.message || err}`,
          },
        ],
      };
    }
  },

  // Create SOT (Status Origination Tree)
  "create-sot": async (params: CreateSotParams) => {
    try {
      await createSot(params);
      return {
        content: [
          {
            type: "text" as const,
            text: `✅ SOTs created/updated successfully. Existing SOTs were preserved`,
          },
        ],
      };
    } catch (err: any) {
      return {
        content: [
          {
            type: "text" as const,
            text: `❌ Failed to create/update SOTs: ${err.message || err}`,
          },
        ],
      };
    }
  },

  // Delete an object
  "delete-object": async (params: DeleteObjectParams) => {
    try {
      await deleteObject(params);
      return {
        content: [
          {
            type: "text" as const,
            text: `✅ Successfully deleted object "${params.objectName}"`,
          },
        ],
      };
    } catch (err: any) {
      return {
        content: [
          {
            type: "text" as const,
            text: `❌ Failed to delete object: ${err.message || err}`,
          },
        ],
      };
    }
  },

  // Create or update RBAC roles
  "create-update-roles": async (params: CreateUpdateRolesParams) => {
    try {
      const result = await createUpdateRoles(params);
      return {
        content: [
          {
            type: "text" as const,
            text: `✅ ${result.message}\n\nRoles processed:\n${result.roles
              .map((role: any) => `- ${role.display_name} (${role.loco_role})`)
              .join("\n")}`,
          },
        ],
      };
    } catch (err: any) {
      return {
        content: [
          {
            type: "text" as const,
            text: `❌ Failed to create/update roles: ${err.message || err}`,
          },
        ],
      };
    }
  },

  // Create or update attributes
  "create-attributes": async (params: CreateAttributeParams) => {
    try {
      const result = await createAttributeHandler.handler(params);
      if (result.success) {
        return {
          content: [
            {
              type: "text" as const,
              text: `✅ Successfully created ${
                params.attributes.length
              } attributes:\n\n${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
      } else {
        return {
          content: [
            {
              type: "text" as const,
              text: `❌ Failed to create attributes: ${result.error}`,
            },
          ],
        };
      }
    } catch (err: any) {
      return {
        content: [
          {
            type: "text" as const,
            text: `❌ Failed to create attributes: ${err.message || err}`,
          },
        ],
      };
    }
  },

  // Add dummy data to tables
  "add-dummy-data": async (params: z.infer<typeof DummyDataSchema>) => {
    const result = await createDummyDataHandler.handler(params);
    return {
      content: [
        {
          type: "text" as const,
          text: result.success
            ? `✅ ${result.message}\n\nResults:\n${JSON.stringify(
                result.results,
                null,
                2
              )}`
            : `❌ Failed to generate dummy data: ${result.error}`,
        },
      ],
    };
  },

  // Publish application
  "publish-app": async (params: PublishAppParams) => {
    try {
      const result = await publishApp(params);
      return {
        content: [
          {
            type: "text" as const,
            text: `✅ ${result.message}`,
          },
        ],
      };
    } catch (err: any) {
      return {
        content: [
          {
            type: "text" as const,
            text: `❌ ${err.message || err}`,
          },
        ],
      };
    }
  },

  // Check publish status
  "check-publish-status": async (params: CheckPublishStatusParams) => {
    try {
      // Validate parameters
      if (!params.baseUrl || !params.identifier || !params.tenantName) {
        throw new Error(
          "Missing required parameters: baseUrl, identifier, and tenantName are required"
        );
      }

      const result = await monitorPublishStatus(
        params.baseUrl,
        params.identifier,
        params.tenantName,
        params.maxChecks || 20,
        params.intervalSeconds || 30
      );

      const formattedStatus = formatStatusOutput(result.status.status);

      // Format versions as simple text instead of JSON
      const formatVersionText = (versions: Record<string, string>) => {
        if (!versions || typeof versions !== "object") {
          return "  No version information available";
        }
        return Object.entries(versions)
          .map(([component, version]) => `  ${component}: ${version || "N/A"}`)
          .join("\n");
      };

      const responseText = result.isComplete
        ? `✅ Application publishing completed after ${
            result.checksPerformed
          } checks!\n\n${formattedStatus}\n\nCurrent Version:\n${formatVersionText(
            result.status.current_version
          )}\n\nDeployed Version:\n${formatVersionText(
            result.status.deployed_version
          )}`
        : `⏳ Application publishing not yet complete after ${result.checksPerformed} checks.\n\n${formattedStatus}\n\nPublishing is considered complete when all components show one of: 'completed', 'success', 'not_started', '' (empty - also completed), or 'failure'.`;

      return {
        content: [
          {
            type: "text" as const,
            text: responseText,
          },
        ],
      };
    } catch (err: any) {
      return {
        content: [
          {
            type: "text" as const,
            text: `❌ Error checking publish status: ${err.message || err}`,
          },
        ],
      };
    }
  },

  // Generate workflows
  "generate-workflow": async (params: GenerateWorkflowParams) => {
    try {
      // Validate required parameters
      if (!params.baseUrl || !params.appId || !params.tenantName) {
        throw new Error(
          "Missing required parameters: baseUrl, appId, and tenantName are required"
        );
      }

      const result = await generateWorkflows(params);

      const successfulCases = result.results.filter((r: any) => r.success);
      const failedCases = result.results.filter((r: any) => !r.success);

      let responseText = `🔄 Workflow Generation Complete!\n\n`;
      responseText += `📊 Summary:\n`;
      responseText += `  • App Name: ${result.appName}\n`;
      responseText += `  • Total Cases: ${result.totalProcessed}\n`;
      responseText += `  • Successful: ${result.successful}\n`;
      responseText += `  • Failed: ${result.failed}\n\n`;

      if (successfulCases.length > 0) {
        responseText += `✅ Successfully Generated Workflows:\n`;
        successfulCases.forEach((item: any) => {
          responseText += `  • ${item.caseObject.name} (${item.caseObject.slug})\n`;
          if (item.deployment?.deploymentId) {
            responseText += `    - Deployment ID: ${item.deployment.deploymentId}\n`;
          }
        });
        responseText += `\n`;
      }

      if (failedCases.length > 0) {
        responseText += `❌ Failed Workflows:\n`;
        failedCases.forEach((item: any) => {
          responseText += `  • ${item.caseObject.name} (${item.caseObject.slug}): ${item.error}\n`;
        });
        responseText += `\n`;
      }

      responseText += `🎯 Workflows have been deployed to Flowable engine and configuration saved to application level.\n\n`;

      // Add publishing information
      if (result.publishing?.attempted) {
        if (result.publishing.success) {
          responseText += `� Automatic App Publishing:\n`;
          responseText += `  ✅ Application has been automatically published after successful workflow generation!\n`;
          responseText += `  📋 Next Steps: Run CHECK_PUBLISH_STATUS to monitor deployment progress.\n\n`;
        } else {
          responseText += `⚠️ Automatic App Publishing:\n`;
          responseText += `  ❌ Failed to automatically publish the application.\n`;
          responseText += `  Error: ${
            result.publishing.result?.error || "Unknown error"
          }\n`;
          responseText += `  🔧 Manual Action Required: Run PUBLISH_APP manually.\n\n`;
        }
      } else if (result.failed > 0) {
        responseText += `⚠️ Publishing Skipped:\n`;
        responseText += `  Some workflows failed, so automatic publishing was skipped.\n`;
        responseText += `  Fix workflow issues before publishing.\n\n`;
      }

      responseText += `📝 Note: Only workitem-type objects are processed for workflow generation.`;

      return {
        content: [
          {
            type: "text" as const,
            text: responseText,
          },
        ],
      };
    } catch (err: any) {
      return {
        content: [
          {
            type: "text" as const,
            text: `❌ Error generating workflows: ${err.message || err}`,
          },
        ],
      };
    }
  },

  // Create automation
  "create-automation": async (params: CreateAutomationParams) => {
    try {
      // Validate required parameters
      if (
        !params.baseUrl ||
        !params.appId ||
        !params.tenantName ||
        !params.email ||
        !params.name ||
        !params.triggerType
      ) {
        throw new Error(
          "Missing required parameters: baseUrl, appId, tenantName, email, name, and triggerType are required"
        );
      }

      // Validate trigger type specific parameters
      if (params.triggerType === "object") {
        if (!params.objectSlug || !params.crudEvent) {
          throw new Error(
            "Object slug and CRUD event are required for object triggers"
          );
        }
      } else if (params.triggerType === "core") {
        if (!params.objectSlug) {
          throw new Error(
            "Object slug is required for core triggers (as task_type)"
          );
        }
      } else if (params.triggerType === "schedule") {
        if (!params.cronExpression) {
          throw new Error(
            "Cron expression is required for schedule triggers (e.g., '*/5 * * * *' for every 5 minutes)"
          );
        }
      }

      const result = await createAutomation(params);

      let responseText = `🤖 Automation Created Successfully!\n\n`;
      responseText += `📋 Automation Details:\n`;
      responseText += `  • Name: ${params.name}\n`;
      responseText += `  • Trigger Type: ${params.triggerType}\n`;

      if (params.triggerType === "object") {
        responseText += `  • Object: ${params.objectSlug}\n`;
        responseText += `  • Event: ${params.crudEvent}\n`;
      } else if (params.triggerType === "core") {
        responseText += `  • Object: ${params.objectSlug}\n`;
        responseText += `  • Core Event: ${params.coreEventName || "import"}\n`;
      } else if (params.triggerType === "schedule") {
        responseText += `  • Schedule: ${
          params.cronExpression || "0 0 * * * (daily at midnight)"
        }\n`;
      }

      if (result.automation?.id) {
        responseText += `  • Automation ID: ${result.automation.id}\n`;
      }

      responseText += `\n🐍 Script Configuration:\n`;
      if (params.scriptDescription) {
        responseText += `  • Description: ${params.scriptDescription}\n`;
      }
      responseText += `  • Language: Python\n`;
      responseText += `  • Template: Auto-generated with logging and payload access\n\n`;

      responseText += `🚀 Automation Features:\n`;
      responseText += `  • Automatic trigger detection\n`;
      responseText += `  • Access to payload and tenant data\n`;
      responseText += `  • Built-in logging functions (log, error, warn, debug)\n`;
      responseText += `  • Ability to make API calls and process data\n\n`;

      switch (params.triggerType) {
        case "object":
          responseText += `📝 Next Steps:\n`;
          responseText += `  • Test the automation by performing ${params.crudEvent} operations on ${params.objectSlug} objects\n`;
          responseText += `  • Check automation logs for execution details\n`;
          responseText += `  • Modify the script if needed to customize behavior\n`;
          break;
        case "schedule":
          responseText += `📅 Schedule Configuration:\n`;
          responseText += `  • Default: Daily at midnight (0 0 * * *)\n`;
          responseText += `  • Modify the cron expression in the automation settings if needed\n`;
          break;
        case "webhook":
          responseText += `🔗 Webhook Configuration:\n`;
          responseText += `  • Webhook URL will be generated automatically by the system\n`;
          responseText += `  • Use the webhook URL to trigger this automation via HTTP POST requests\n`;
          responseText += `  • Webhook payload will be available in the script as 'payload' variable\n`;
          responseText += `  • Perfect for integrating with external services and APIs\n`;
          break;
        case "core":
          responseText += `⚙️ System Event Configuration:\n`;
          responseText += `  • Triggers on core system events (${
            params.coreEventName || "import"
          })\n`;
          responseText += `  • Associated with object: ${params.objectSlug}\n`;
          responseText += `  • Monitor automation logs for execution details\n`;
          break;
      }

      return {
        content: [
          {
            type: "text" as const,
            text: responseText,
          },
        ],
      };
    } catch (err: any) {
      return {
        content: [
          {
            type: "text" as const,
            text: `❌ Error creating automation: ${err.message || err}`,
          },
        ],
      };
    }
  },

  // Create navbar
  "create-navbar": async (params: CreateNavbarParams) => {
    try {
      // Step 1: Get app contract to get roles and objects
      const appContract = await getAppContract({
        baseUrl: params.baseUrl,
        appId: params.appId,
        tenantName: params.tenantName,
      });

      // Step 2: Get app pages
      const pagesResult = await getAppPages({
        baseUrl: params.baseUrl,
        tenantName: params.tenantName,
        appId: params.appId,
      });

      if (!pagesResult.success) {
        throw new Error(`Failed to get app pages: ${pagesResult.message}`);
      }

      // Get role information (excluding administrator)
      const existingPermissions = appContract?.permission || {};
      const filteredRoles = Object.keys(existingPermissions).filter(
        (roleName) => roleName.toLowerCase() !== "administrator"
      );
      const totalRoles = filteredRoles.length;

      // Step 3: Create navbar using the enhanced service
      const result = await createNavbar({
        ...params,
        appContract,
        appPages: pagesResult.pages,
      });

      if (result.success) {
        return {
          content: [
            {
              type: "text" as const,
              text:
                `✅ **Role-Based Navbars Created Successfully**\n\n` +
                `📋 **Navbar Details:**\n` +
                `  • Total Roles in App: ${
                  Object.keys(existingPermissions).length
                }\n` +
                `  • Navbars Created: ${totalRoles} (Administrator excluded)\n` +
                `  • Roles: ${filteredRoles.join(", ")}\n` +
                `  • Total Pages Available: ${
                  pagesResult.pages?.length || 0
                }\n` +
                `  • Navbar ID: ${result.navbar_id || "Generated"}\n` +
                `  • User Mapping ID: ${
                  result.user_mapping_id || "Not mapped"
                }\n\n` +
                `🎯 **Generated Navbar Structure:**\n` +
                result.navbar_items
                  .map(
                    (item) =>
                      `  📁 **${item.display_name}** (${
                        item.children ? item.children.length : 0
                      } items)\n` +
                      (item.children
                        ? item.children
                            .map(
                              (child) =>
                                `    └─ ${child.display_name} (${child.route})`
                            )
                            .join("\n")
                        : "")
                  )
                  .join("\n\n") +
                `\n\n📊 **Role-Based Page Access:**\n` +
                `  • Pages filtered by role permissions (loco_permission)\n` +
                `  • All routes use page_id format: /{page_id}\n` +
                `  • SOW structure maintained across all roles\n` +
                `  • Administrator role excluded from creation\n\n` +
                `🔧 **Tools Executed:**\n` +
                `  • get-app-contract: ✅ Retrieved roles and objects\n` +
                `  • get-app-pages: ✅ Retrieved ${
                  pagesResult.pages?.length || 0
                } pages\n\n` +
                `📈 **Summary:** ${result.message}`,
            },
          ],
        };
      } else {
        return {
          content: [
            {
              type: "text" as const,
              text: `❌ **Failed to create navbars:** ${result.message}`,
            },
          ],
        };
      }
    } catch (err: any) {
      return {
        content: [
          {
            type: "text" as const,
            text: `❌ **Error creating navbars:** ${err.message || err}`,
          },
        ],
      };
    }
  },

  // Get app pages
  "get-app-pages": async (params: GetAppPagesParams) => {
    try {
      const result = await getAppPages(params);
      if (result.success) {
        const pagesText =
          result.pages.length > 0
            ? result.pages
                .map(
                  (page) =>
                    `  • **${page.display_name || page.name}** (ID: ${
                      page.page_id
                    })\n` +
                    `    - Type: ${page.type}\n` +
                    `    - App ID: ${page.application_id}\n` +
                    `    - Workitem: ${page.workitem_name || "N/A"} (${
                      page.workitem_slug || "N/A"
                    })\n` +
                    `    - Mode: ${page.mode}\n` +
                    `    - Default: ${page.is_default ? "Yes" : "No"}\n` +
                    `    - Created: ${new Date(
                      page.created_at
                    ).toLocaleDateString()}`
                )
                .join("\n\n")
            : "  No pages found.";

        return {
          content: [
            {
              type: "text" as const,
              text: `✅ **Pages Retrieved Successfully**

📊 **Summary:**
- **Total Pages Found:** ${result.total}
- **Filtered:** ${result.filtered ? "Yes" : "No"}
${
  params.appId
    ? `- **App ID Filter:** ${params.appId}`
    : "- **Scope:** All applications"
}

📄 **Pages:**
${pagesText}

🎯 ${result.message}`,
            },
          ],
        };
      } else {
        return {
          content: [
            {
              type: "text" as const,
              text: `❌ **Failed to retrieve pages**

**Error:** ${result.message}

**Debug Info:**
- **Base URL:** ${params.baseUrl}
- **Tenant Name:** ${params.tenantName}
- **App ID:** ${params.appId || "Not specified"}
- **API Key Set:** ${process.env.MCP_API_KEY ? "Yes" : "No"}

**Troubleshooting:**
- Verify that the base URL is correct and accessible
- Check that the tenant name exists
- Ensure the API key (MCP_API_KEY) is valid
- Confirm the API endpoint is available
- Check tenant permissions for page access`,
            },
          ],
        };
      }
    } catch (err: any) {
      return {
        content: [
          {
            type: "text" as const,
            text: `❌ Error retrieving pages: ${err.message || err}`,
          },
        ],
      };
    }
  },

  // Create job title
  "create-job-title": async (params: CreateJobTitleParams) => {
    try {
      const result = await createJobTitle(params);

      if (result.success) {
        return {
          content: [
            {
              type: "text" as const,
              text:
                `✅ **Job Titles Created Successfully**\n\n` +
                `📋 **Job Title Details:**\n` +
                `  • Application ID: ${params.appId}\n` +
                `  • Department: ${params.department || "Engineering"}\n` +
                `  • Assigned To: ${params.assignedTo || "System"}\n` +
                `  • Total Job Titles Created: ${
                  result.created_job_titles?.length || 0
                }\n` +
                `  • Administrator Role: Excluded from creation\n\n` +
                `🎯 **Created Job Titles:**\n` +
                (result.created_job_titles
                  ? result.created_job_titles
                      .map(
                        (jt) =>
                          `  📝 **${jt.jobTitleName}**\n` +
                          `    └─ Role: ${jt.role}\n` +
                          `    └─ Role ID: ${jt.roleId}\n` +
                          `    └─ Navbar ID: ${
                            jt.navbarId || "Not assigned"
                          }\n` +
                          `    └─ Job Title ID: ${jt.jobTitleId || "Generated"}`
                      )
                      .join("\n\n")
                  : "No job titles created") +
                `\n\n🔧 **Integration Details:**\n` +
                `  • Each job title is linked to its corresponding role\n` +
                `  • Job titles are mapped to created navbars automatically\n` +
                `  • All job titles are set to active status\n` +
                `  • Role-based permissions are inherited\n\n` +
                `📊 **Summary:** ${result.message}`,
            },
          ],
        };
      } else {
        return {
          content: [
            {
              type: "text" as const,
              text: `❌ **Failed to create job titles:** ${result.message}`,
            },
          ],
        };
      }
    } catch (err: any) {
      return {
        content: [
          {
            type: "text" as const,
            text: `❌ **Error creating job titles:** ${err.message || err}`,
          },
        ],
      };
    }
  },

  // Create user
  "create-user": async (params: CreateUserParams) => {
    try {
      const result = await createUser(params);

      if (result.success) {
        return {
          content: [
            {
              type: "text" as const,
              text:
                `✅ **Users Created Successfully**\n\n` +
                `👥 **User Creation Details:**\n` +
                `  • Application ID: ${params.appId}\n` +
                `  • Department: ${params.department || "Engineering"}\n` +
                `  • Total Users Created: ${
                  result.created_users?.length || 0
                }\n` +
                `  • Administrator Role: Excluded from creation\n\n` +
                `🎯 **Created Users:**\n` +
                (result.created_users
                  ? result.created_users
                      .map(
                        (user) =>
                          `  👤 **${user.userName}**\n` +
                          `    └─ Role: ${user.role}\n` +
                          `    └─ Email: ${user.email}\n` +
                          `    └─ Job Title: ${user.jobTitle}\n` +
                          `    └─ Department: ${user.department}\n` +
                          `    └─ User ID: ${user.userId || "Generated"}`
                      )
                      .join("\n\n")
                  : "No users created") +
                `\n\n🔧 **Integration Details:**\n` +
                `  • Each user is linked to their corresponding role and job title\n` +
                `  • Users are mapped to navbars via role associations\n` +
                `  • All users are set to 'todo' status (ready for assignment)\n` +
                `  • Email format: {app_slug}.{rolename}@amoga.app\n` +
                `  • Passwords are set to email address (changeable)\n\n` +
                `📊 **Summary:** ${result.message}`,
            },
          ],
        };
      } else {
        return {
          content: [
            {
              type: "text" as const,
              text: `❌ **Failed to create users:** ${result.message}`,
            },
          ],
        };
      }
    } catch (err: any) {
      return {
        content: [
          {
            type: "text" as const,
            text: `❌ **Error creating users:** ${err.message || err}`,
          },
        ],
      };
    }
  },
};
