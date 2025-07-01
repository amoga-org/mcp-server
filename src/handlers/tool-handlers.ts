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
} from "../types/app.types.js";
import { createAttributeHandler } from "./attribute-handler.js";
import { createDummyDataHandler } from "./dummy-data-handler.js";
import { DummyDataSchema } from "../schemas/dummy-data-schema.js";
import {
  monitorPublishStatus,
  formatStatusOutput,
} from "../services/publish-status.service.js";

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
};
