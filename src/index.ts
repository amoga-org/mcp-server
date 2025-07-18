#!/usr/bin/env node

/**
 * MCP Server for App Studio
 * A Model Context Protocol server for low-code application development
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import dotenv from "dotenv";

// Configuration and constants
import { TOOL_DESCRIPTIONS } from "./constants/tool-descriptions.js";
import { SERVER_CAPABILITIES } from "./config/capabilities.js";

// Type definitions and schemas
import {
  CreateAppSchema,
  GetAppsSchema,
  DeleteAppSchema,
  GetAppContractSchema,
  CreateObjectSchema,
  CreateSotSchema,
  DeleteObjectSchema,
  CreateUpdateRolesSchema,
  CreateAttributeSchema,
  PublishAppSchema,
  CheckPublishStatusSchema,
  GenerateWorkflowSchema,
  CreateAutomationSchema,
  CreateAutomationBaseSchema,
  CreateNavbarSchema,
  GetAppPagesSchema,
  CreateJobTitleSchema,
  CreateUserSchema,
} from "./types/app.types.js";
import { DummyDataSchema } from "./schemas/dummy-data-schema.js";

// Tool handlers
import { toolHandlers } from "./handlers/tool-handlers.js";

// Environment configuration
dotenv.config();

if (!process.env.MCP_API_KEY) {
  console.error("MCP_API_KEY environment variable is not set");
  process.exit(1);
}

// Create server instance
const server = new McpServer({
  name: "amogastudio",
  version: "1.0.0",
  capabilities: {
    resources: SERVER_CAPABILITIES.resources,
    tools: {
      "create-app": {
        description: TOOL_DESCRIPTIONS.CREATE_APP,
        parameters: CreateAppSchema,
      },
      "get-apps": {
        description: TOOL_DESCRIPTIONS.GET_APPS,
        parameters: GetAppsSchema,
      },
      "delete-app": {
        description: TOOL_DESCRIPTIONS.DELETE_APP,
        parameters: DeleteAppSchema,
      },
      "get-app-contract": {
        description: TOOL_DESCRIPTIONS.GET_APP_CONTRACT,
        parameters: GetAppContractSchema,
      },
      "create-object": {
        description: TOOL_DESCRIPTIONS.CREATE_OBJECT,
        parameters: CreateObjectSchema,
      },
      "create-sot": {
        description: TOOL_DESCRIPTIONS.CREATE_SOT,
        parameters: CreateSotSchema,
      },
      "delete-object": {
        description: TOOL_DESCRIPTIONS.DELETE_OBJECT,
        parameters: DeleteObjectSchema,
      },
      "create-update-roles": {
        description: TOOL_DESCRIPTIONS.CREATE_UPDATE_ROLES,
        parameters: CreateUpdateRolesSchema,
      },
      "create-attributes": {
        description: TOOL_DESCRIPTIONS.CREATE_UPDATE_ATTRIBUTE,
        parameters: CreateAttributeSchema,
      },
      "add-dummy-data": {
        description: TOOL_DESCRIPTIONS.ADD_DUMMY_DATA,
        parameters: DummyDataSchema,
      },
      "publish-app": {
        description: TOOL_DESCRIPTIONS.PUBLISH_APP,
        parameters: PublishAppSchema,
      },
      "check-publish-status": {
        description: TOOL_DESCRIPTIONS.CHECK_PUBLISH_STATUS,
        parameters: CheckPublishStatusSchema,
      },
      "generate-workflow": {
        description: TOOL_DESCRIPTIONS.GENERATE_WORKFLOW,
        parameters: GenerateWorkflowSchema,
      },
      "create-automation": {
        description: TOOL_DESCRIPTIONS.CREATE_AUTOMATION,
        parameters: CreateAutomationSchema,
      },
      "create-navbar": {
        description: TOOL_DESCRIPTIONS.CREATE_NAVBAR,
        parameters: CreateNavbarSchema,
      },
      "get-app-pages": {
        description: TOOL_DESCRIPTIONS.GET_APP_PAGES,
        parameters: GetAppPagesSchema,
      },
      "create-job-title": {
        description: TOOL_DESCRIPTIONS.CREATE_JOB_TITLE,
        parameters: CreateJobTitleSchema,
      },
      "create-user": {
        description: TOOL_DESCRIPTIONS.CREATE_USER,
        parameters: CreateUserSchema,
      },
    },
  },
});

// Register tool handlers
server.tool(
  "create-app",
  TOOL_DESCRIPTIONS.CREATE_APP,
  CreateAppSchema.shape,
  toolHandlers["create-app"]
);
server.tool(
  "get-apps",
  TOOL_DESCRIPTIONS.GET_APPS,
  GetAppsSchema.shape,
  toolHandlers["get-apps"]
);
server.tool(
  "delete-app",
  TOOL_DESCRIPTIONS.DELETE_APP,
  DeleteAppSchema.shape,
  toolHandlers["delete-app"]
);
server.tool(
  "get-app-contract",
  TOOL_DESCRIPTIONS.GET_APP_CONTRACT,
  GetAppContractSchema.shape,
  toolHandlers["get-app-contract"]
);
server.tool(
  "create-object",
  TOOL_DESCRIPTIONS.CREATE_OBJECT,
  CreateObjectSchema.shape,
  toolHandlers["create-object"]
);
server.tool(
  "create-sot",
  TOOL_DESCRIPTIONS.CREATE_SOT,
  CreateSotSchema.shape,
  toolHandlers["create-sot"]
);
server.tool(
  "delete-object",
  TOOL_DESCRIPTIONS.DELETE_OBJECT,
  DeleteObjectSchema.shape,
  toolHandlers["delete-object"]
);
server.tool(
  "create-update-roles",
  TOOL_DESCRIPTIONS.CREATE_UPDATE_ROLES,
  CreateUpdateRolesSchema.shape,
  toolHandlers["create-update-roles"]
);
server.tool(
  "create-attributes",
  TOOL_DESCRIPTIONS.CREATE_UPDATE_ATTRIBUTE,
  CreateAttributeSchema.shape,
  toolHandlers["create-attributes"]
);
server.tool(
  "add-dummy-data",
  TOOL_DESCRIPTIONS.ADD_DUMMY_DATA,
  DummyDataSchema.shape,
  toolHandlers["add-dummy-data"]
);
server.tool(
  "publish-app",
  TOOL_DESCRIPTIONS.PUBLISH_APP,
  PublishAppSchema.shape,
  toolHandlers["publish-app"]
);
server.tool(
  "check-publish-status",
  TOOL_DESCRIPTIONS.CHECK_PUBLISH_STATUS,
  CheckPublishStatusSchema.shape,
  toolHandlers["check-publish-status"]
);
server.tool(
  "generate-workflow",
  TOOL_DESCRIPTIONS.GENERATE_WORKFLOW,
  GenerateWorkflowSchema.shape,
  toolHandlers["generate-workflow"]
);
server.tool(
  "create-automation",
  TOOL_DESCRIPTIONS.CREATE_AUTOMATION,
  CreateAutomationBaseSchema.shape,
  toolHandlers["create-automation"]
);
server.tool(
  "get-app-pages",
  TOOL_DESCRIPTIONS.GET_APP_PAGES,
  GetAppPagesSchema.shape,
  toolHandlers["get-app-pages"]
);
server.tool(
  "create-navbar",
  TOOL_DESCRIPTIONS.CREATE_NAVBAR,
  CreateNavbarSchema.shape,
  toolHandlers["create-navbar"]
);
server.tool(
  "create-job-title",
  TOOL_DESCRIPTIONS.CREATE_JOB_TITLE,
  CreateJobTitleSchema.shape,
  toolHandlers["create-job-title"]
);
server.tool(
  "create-user",
  TOOL_DESCRIPTIONS.CREATE_USER,
  CreateUserSchema.shape,
  toolHandlers["create-user"]
);
/**
 * Main function to start the MCP server
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("App studio MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
