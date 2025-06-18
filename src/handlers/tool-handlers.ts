/**
 * Tool handlers for the MCP server
 * This file contains all the tool implementation handlers
 */

import {
  createApp,
  getAllApps,
  deleteApp,
  getAppContract,
  createObject,
  createSot,
  deleteObject,
} from "../services/app.service.js";
import {
  CreateAppParams,
  GetAppsParams,
  DeleteAppParams,
  GetAppContractParams,
  CreateObjectParams,
  CreateSotParams,
  DeleteObjectParams,
} from "../types/app.types.js";

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
};
